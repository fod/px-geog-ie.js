(function() {

    var px = Px.prototype;

    px.isGeographical = function() {
	// TODO: Allow for datasets with more than one geog dimension
	var vars = this.variables();
	var name = this.keyword('MATRIX');
	
	_.any(vars, function(d, i) {
	    if (d.match(this.geogRx)) {
		this.geogIdx = i;
		return true;
	    }
	    else {
		return false;
	    }
	}, this);
    };

    px.hasCounties = function() {

	this.isGeographical();

	var vals = this.values(this.geogIdx),
	    areaCodes = this.codes(this.geogIdx),
	    areaType,
	    codeIdx;

	if (this.geogIdx === undefined || (vals.length < 20)) {
	    return false;
	}

	if (_.any(vals, function(d) { return d.match(/fingal/i); })) {
	    if (_.any(areaCodes, function(d) { return d === '5001'; })) {
		areaType = 'codub';
		codeIdx = 0;
	    }
	    else {
		areaType = 'coadm';
		var possCodes = ['181', '02061', 'IE2404', '2&', '20701'];
		codeIdx = this.idCodeMulti(possCodes, areaCodes);		     
	    }
	}
	else {
	    var possCodes = ['171', 'IE2304', '02051', '63'];
	    codeIdx = this.idCodeMulti(possCodes, areaCodes);
	    if (codeIdx) {
		areaType = 'cotip';
	    }
	    else {
		areaType = 'coreg';
		codeIdx = 0;
	    }
	}
	this.areaType = areaType;
	this.areaCodeIdx = codeIdx;
	return true;
    };

    px.idCodeMulti = function(possCodes, areaCodes) {
    	for (i = 0, l = possCodes.length; i < l; i++) {
	    if (_.any(areaCodes, function(d) { return d === possCodes[i]; })) {
		return i;
	    }
	}
	return undefined;
    };

    px.hasNUTS3 = function() {

	this.isGeographical();

	if (this.geogIdx === undefined) {
	    return false;
	}

	var areaCodes = this.codes(this.geogIdx),
            nuts3 = ['IE11', 'IE12', 'IE13', 'IE22', 'IE23', 'IE24', 'IE25'];

	if (_.all(nuts3, function(d) { return _.include(areaCodes, d); })) {
	    this.areaType = 'regnuts3';
	    this.areaCodeIdx = 0;
	    return true;
	}
	else {
	    return false;
	}
    };

    px.translateGeogCodes = function(selection) {

	var areaCodes = this.codes(this.geogIdx),          // current areacodes
	    dataset = this.datadict(selection),             // column of data
            areaDecode = this.geogCodeDict[this.areaType]; // areacode dict section for current areatype

	var decode = {};
	_.each(areaDecode, function(v, k) {
	    decode[k] = dataset[v[this.areaCodeIdx]];
	}, this);
	return decode;
    };

    px.geogRx = /^(.*(?:region|area|county|electoral|authority|residence|office).*)$/i;

    px.geogCodeDict = {"coadm":{"33":["25","0402","IE1102","41","402"],"32":["24","0401","IE1101","40","401"],"21":["162","02042","IE2303","27","20402"],"05":["024","01022","IE2102","03","10102"],"26":["191","03011","IE1301","30","30101"],"17":["141","02021","IE2501","21","20101"],"04":["023","01023","IE2103","02","10103"],"02":["021","01021","IE2101","00","10101"],"18":["142","02022","IE2502","22","20102"],"03":["022","01024","IE2104","04","10104"],"30":["22","0304","IE1304","33","304"],"16":["13","0201","IE2301","20","202"],"06":["03","0103","IE2201","11","103"],"27":["192","03012","IE1302","35","30102"],"25":["182","02062","IE2405","2&","20702"],"28":["20","0302","IE1103","31","302"],"01":["01","0101","IE2401","10","102"],"20":["161","02041","IE2302","26","20401"],"14":["11","0111","IE2406","19","111"],"07":["04","0104","IE2402","12","104"],"24":["181","02061","IE2404","-2","20701"],"10":["07","0107","IE1104","15","107"],"31":["23","0305","IE1106","34","305"],"11":["08","0108","IE2202","16","108"],"22":["171","02051","IE2304","28","205"],"08":["05","0105","IE1201","13","105"],"13":["10","0110","IE1204","18","110"],"23":["172","02052","IE2403","29","206"],"29":["21","0303","IE1303","32","303"],"12":["09","0109","IE1203","17","109"],"15":["12","0112","IE2203","-1","112"],"34":["26","0403","IE1105","42","403"],"19":["15","0203","IE2503","25","203"],"09":["06","0106","IE1202","14","106"]},"cotip":{"33":["25","IE1102","0402","71"],"32":["24","IE1101","0401","21"],"11":["08","IE2202","0108","13"],"21":["16","5003","0204","62"],"02":["02","IE21","0102","11"],"22":["171","IE2304","02051","63"],"18":["14","5001","0202","51"],"08":["05","IE1201","0105","81"],"30":["22","IE1304","0304","84"],"23":["172","IE2403","02052","33"],"16":["13","IE2301","0201","61"],"13":["10","IE1204","0110","85"],"06":["03","IE2201","0103","12"],"29":["21","IE1303","0303","42"],"27":["19","5002","0301","41"],"25":["18","5004","0206","34"],"28":["20","IE1103","0302","72"],"01":["01","IE2401","0101","31"],"12":["09","IE1203","0109","83"],"14":["11","IE2406","0111","35"],"15":["12","IE2203","0112","14"],"07":["04","IE2402","0104","32"],"34":["26","IE1105","0403","23"],"10":["07","IE1104","0107","22"],"19":["15","IE2503","0203","52"],"31":["23","IE1106","0305","73"],"09":["06","IE1202","0106","82"]},"codub":{"33":["IE1102"],"32":["IE1101"],"11":["IE2202"],"21":["5003"],"05":["IE2102"],"04":["IE2103"],"02":["IE2101"],"22":["IE2304"],"18":["5001"],"03":["IE2104"],"08":["IE1201"],"30":["IE1304"],"23":["IE2403"],"16":["IE2301"],"13":["IE1204"],"06":["IE2201"],"29":["IE1303"],"27":["5002"],"25":["5004"],"28":["IE1103"],"01":["IE2401"],"12":["IE1203"],"14":["IE2406"],"15":["IE2203"],"07":["IE2402"],"34":["IE1105"],"19":["IE2503"],"10":["IE1104"],"31":["IE1106"],"09":["IE1202"]},"regnuts3":{"011":["IE11"],"021":["IE21"],"022":["IE22"],"013":["IE13"],"024":["IE24"],"025":["IE25"],"023":["IE23"],"012":["IE12"]},"coreg":{"33":["25"],"32":["24"],"11":["08"],"21":["16"],"02":["02"],"22":["17"],"18":["14"],"08":["05"],"30":["22"],"16":["13"],"13":["10"],"06":["03"],"29":["21"],"27":["19"],"25":["18"],"28":["20"],"01":["01"],"12":["09"],"14":["11"],"15":["12"],"07":["04"],"34":["26"],"10":["07"],"19":["15"],"31":["23"],"09":["06"]}};

}());

