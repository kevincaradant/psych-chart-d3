var pc = new function() {

	var CtoF = function(x){ return x * 9 / 5 + 32 }

	this.margin = 40
	this.rbmargin = 60
	this.width = 1200
	this.height = 700
	this.db_min = 10
	this.db_max = 36

	this.db_extent = [this.db_min, this.db_max] /*on rentre des valeurs allant de db_min a db_max pour l'axe des abscisses*/
	this.db_scale = d3.scale.linear()
		            .range([this.margin,this.width - this.rbmargin]) /*la taille de l'axe que l'on veut dessiner; exemple si domain=100,500 et range=10,200, alors db_scale(100)=10 et db_scale(500)=200*/
		            .domain(this.db_extent)/*la palette de valeurs que l'on rentre*/

	this.db_extent_F = [CtoF(this.db_min), CtoF(this.db_max)]
	this.db_scale_F = d3.scale.linear()
		            .range([this.margin,this.width - this.rbmargin])
		            .domain(this.db_extent_F)
		          
	this.hr_extent = [0, 30]
	this.hr_scale = d3.scale.linear()
		            .range([this.height - this.rbmargin, this.rbmargin])
		            .domain(this.hr_extent)

	this.pline = d3.svg.line()
		         .x(function(d){return this.db_scale(d.db)})
		         .y(function(d){return this.hr_scale(1000 * d.hr)})


	/**************************************************
	*	Function : drawChart
	*	use      : draw the whole psychrometric chart
	*	argument : data from json to draw the humidity lines every 10%
	*	returns  : 
	**************************************************/
	this.drawChart = function(data) {
	
		//console.log(data)
		var db_axis = d3.svg.axis().scale(pc.db_scale)
		var db_axis_F = d3.svg.axis().scale(pc.db_scale_F)
		var hr_axis = d3.svg.axis().scale(pc.hr_scale).orient("right")

		var line = d3.svg.line()
				     .x(function(d){return pc.db_scale(d.db)})
				     .y(function(d){return pc.hr_scale(1000 * d.hr)})
				     .interpolate('cardinal')

		var dpoly = data.rh100.concat({"db":9, "hr": 0.03})

		d3.select("body")
		  .append("svg")
		.attr("class", "chart")
			.attr("width", pc.width)
			.attr("height", pc.height)

		d3.select("svg")
		.append("rect")
		  .attr("width", pc.width - pc.margin - pc.rbmargin)
		  .attr("height", pc.height	 - pc.margin - pc.rbmargin-20)
		  .attr("class", "chartbg")
		  .attr("transform", "translate(" + pc.margin + "," + pc.rbmargin + ")")

		d3.select("svg")
		  .append("defs")
		  .append("clipPath")
			.attr("id", "clip")
		  .append("rect")
			.attr("x", "0")
			.attr("y", "0")
			.attr("width", pc.width - pc.margin - pc.rbmargin)
			.attr("height", pc.height - pc.margin - pc.rbmargin-20)
			.attr("transform", "translate(" + pc.margin + "," + pc.rbmargin + ")")

		d3.select("svg")
		  .append("path")
			.attr("d", line(dpoly)) 
			.attr("class", "w")

		d3.select("svg")
		  .append("path")
			.attr("d", line(data.rh100))
			.attr("class", "rh100")
			.attr("clip-path", "url(#clip)")

		for (var key in data){
		  if (key=="rh100") continue
		  d3.select("svg")
			.append("path")
			  .attr("d", line(data[key]))
			  .attr("class", "rhline")
			  .attr("clip-path", "url(#clip)")
		}
	

		/**************************************************
		*	Function : drawPoint
		*	use      : draw the temperature above the wetBulb line
		*	argument : data from json
		*	returns  : 
		**************************************************/
		this.drawPoint = function(data){


			for (var key in data){
			//console.log("key "+key);
				for(var i=0;i<11;i++){
					d3.select("svg")
					  .append("rect")
						.style("fill", "black")
						.attr("height", 7) 
			   			.attr("width", 7)
			   			.attr("opacity", 0.5)
						.attr("x", pc.db_scale(data.rh100[i].db)-3)
						.attr("y", pc.hr_scale(1000 * data.rh100[i].hr)-5);

						d3.select("svg")  
						  .append("text")
							.text((10+2*i))
							.attr("x", (pc.db_scale(data.rh100[i].db)-10))
							.attr("y", (pc.hr_scale(1000 * data.rh100[i].hr)-10))
							.attr("font-size", "15px")
							.attr("fill", "black");
				}
			}
		}
		drawPoint(data);





		/**************************************************
		*	Function : CALCULATION PART ONE
		*	use      : NOT USED YET
		*	argument : 
		*	returns  : 
		**************************************************/

		/*
		var RGAS = 8.314472;       // Universal gas constant in J/mol/K
		var MOLMASSAIR = 0.028966;     // mean molar mass of dry air in kg/mol
		var KILO = 1.0*Math.pow(10,3);             // exact
		var ZEROC = 273.15;            // Zero ºC expressed in K
		var INVALID = -99999;          // Invalid value

		this.getHumRatioFromRelHum = function(TDryBulb, RelHum, Pressure){
			//console.log('Passage dans la fonction getHumRatioFromRelHum');
			var VapPres;
			if(!(RelHum >= 0 && RelHum <= 1)){
				console.log('Erreur dans la fonction getHumRatioFromRelHum');
			}
			VapPres = GetVapPresFromRelHum(TDryBulb, RelHum);
			return GetHumRatioFromVapPres(VapPres, Pressure);
		}

		this.GetVapPresFromRelHum = function(TDryBulb, RelHum){
			//console.log('Passage dans la fonction GetVapPresFromRelHum');
			if(!(RelHum >= 0 && RelHum <= 1)){
				console.log('Erreur dans la fonction GetVapPresFromRelHum '+RelHum);
			}
			return RelHum*GetSatVapPres(TDryBulb);
		}

		this.GetSatVapPres = function(TDryBulb){
			//console.log('Passage dans la fonction GetSatVapPres');
			var LnPws;
			var T;
			if(!(TDryBulb >= -100.0 && TDryBulb <= 200.0)){
				console.log('Erreur dans la fonction GetSatVapPres '+TDryBulb);
			}

			T = CTOK(TDryBulb);
			if (TDryBulb >= -100. && TDryBulb <= 0.){
				LnPws = (-5.6745359E+03/T + 6.3925247 - 9.677843E-03*T + 6.2215701E-07*T*T + 2.0747825E-09*Math.pow(T, 3) - 9.484024E-13*Math.pow(T, 4) + 4.1635019*Math.log(T));
			}else if (TDryBulb > 0. && TDryBulb <= 200.){
				LnPws = -5.8002206E+03/T + 1.3914993 - 4.8640239E-02*T + 4.1764768E-05*T*T - 1.4452093E-08*Math.pow(T, 3) + 6.5459673*Math.log(T);
			}else{
				return INVALID;             // TDryBulb is out of range [-100, 200]
			}
			return Math.exp(LnPws);
		}

		this.CTOK = function(T_C){
			//console.log('Passage dans la fonction CTOK');
			return T_C+ZEROC;
		}

		this.GetHumRatioFromVapPres = function(VapPres, Pressure){
			//console.log('Passage dans la fonction GetHumRatioFromVapPres');
			if(!(VapPres >= 0)){
				console.log('Erreur dans la fonction GetHumRatioFromVapPres');
			}
			return 0.621945*VapPres/(Pressure-VapPres);
		}

		var testTruc = getHumRatioFromRelHum(14, 1, 100594);
		//console.log("hum ratio pour 14 1 100594 : "+testTruc);
		*/



	
		/**************************************************
		*	Function : CALCULATION PART TWO
		*	use      : NOT USED
		*	argument : 
		*	returns  : 
		**************************************************/

		/*
		var Cpas = 1.006 ;		//kJ*kg^-1*K^-1
		var Cpv = 1.026 ;		//kJ*kg^-1*K^-1
		var Lvo = 2500 ;		//kJ*kg^-1

		this.calculerHumidityRatio = function(temperature){
			hsm = (Cpas * temperature) + Lvo ;
			x = (hsm/Lvo) - ((Cpas/Lvo)*temperature) ;
			return x;
		}

		this.calculerAbscisse = function(temperature){
			theta = ((Cpas * (temperature+273.15)) + Lvo)/Lvo ;
			console.log("CALCUL ISENTHALPES : Drybulb = "+(theta-273.15)+" pour WetBulb = "+temperature);
			return theta-273,15;
		}

		//console.log("humidity ratio: "+calculerHumidityRatio(15));
		*/

			



		/**************************************************
		*	Function : drawVerticales
		*	use      : draw the verticales blue lines on the chart
		*	argument : 
		*	returns  : 
		**************************************************/
		this.drawVerticales = function(){	
				for (var key in data){
					if (key=="rh100"){
						for (var i=0;i<14;i++){
							d3.select("svg")
								.append("path")
				  				.attr("d", "m "+pc.db_scale(data.rh100[i].db)+" "+pc.hr_scale(1000*data.rh100[i].hr)+" L "+pc.db_scale(data.rh100[i].db)+" "+pc.height)
				  				.attr("stroke-width", 2)
								.attr("stroke", "blue")
								.attr("stroke-opacity", 0.5)
								.attr("clip-path", "url(#clip)");
						}
					}
				}
		}
		drawVerticales();


		/**************************************************
		*	Function : drawIsenthalpes
		*	use      : draw the Isenthalpes green lines on the chart
		*	argument : 
		*	returns  : 
		**************************************************/
		this.drawIsenthalpes = function(){	
				for (var key in data){
					if (key=="rh100"){
						for (var i=0;i<14;i++){
							d3.select("svg")
								.append("path")
				  				.attr("d", "m "+pc.db_scale(data.rh100[i].db)+" "+pc.hr_scale(1000*data.rh100[i].hr)+" L "+(pc.db_scale(data.rh100[i].db+35)+20*i)+" "+(pc.height+pc.rbmargin))
				  				.attr("stroke-width", 2)
								.attr("stroke", "green")
								.attr("stroke-opacity", 0.5)
								.attr("clip-path", "url(#clip)");
						}
					}
				}
		}
		drawIsenthalpes();


		/**************************************************
		*	Function : drawZones
		*	use      : draw the three areas representing the DryCooler, the EvaporativeTower and the Chiller areas
		*	argument : the set point on the wetbulb
		*	returns  : 
		**************************************************/
		var wetBulb = 12;
		this.drawZones = function(wetBulb){
			for (var key in data){
				if (key=="rh100"){
					for (var i=0;i<14;i++){
						if(data.rh100[i].db == wetBulb){
							//DRY COOLER
							var z1 = d3.select("svg")
							  .append("polygon")
							  	.attr("id", "z1")
								.attr("clip-path", "url(#clip)")
								.datum(function(){return this.points;})
								.attr("points", pc.db_scale(data.rh100[i].db)+","+pc.hr_scale(1000*data.rh100[i].hr)+" "+pc.db_scale(data.rh100[i].db)+","+(pc.height-pc.rbmargin)+" "+pc.margin+","+(pc.height-pc.rbmargin)+" "+pc.margin+","+pc.hr_scale(1000*data.rh100[0].hr)) 
								.attr("fill", "green")
								.attr("fill-opacity", 0.2);
						
							//EVAPORATIVE TOWER
							var z2 = d3.select("svg")
							  .append("polygon")
							  	.attr("id", "z2")
								.attr("clip-path", "url(#clip)")
								.datum(function(){return this.points;})
								.attr("points", pc.db_scale(data.rh100[i].db)+","+pc.hr_scale(1000*data.rh100[i].hr)+" "+(pc.db_scale(data.rh100[i].db+35)+20*i)+","+(pc.height+pc.rbmargin)+" "+(pc.width-pc.rbmargin)+","+(pc.height-pc.rbmargin)+" "+pc.db_scale(data.rh100[i].db)+","+(pc.height-pc.rbmargin)) 
								.attr("fill", "blue")
								.attr("fill-opacity", 0.2);
					
							//CHILLER
							for (var key in data){
								if (key=="rh100"){
									for (var j=0;j<14;j++){
										if(data.rh100[j].db == 32){
											var xChiller = pc.db_scale(data.rh100[j].db)-15;
										}
									}
								}
							}
							var z3 = d3.select("svg")
							  .append("polygon")
							  	.attr("id", "z3")
								.attr("clip-path", "url(#clip)")
								.datum(function(){return this.points;})
								.attr("points", pc.db_scale(data.rh100[i].db)+","+pc.hr_scale(1000*data.rh100[i].hr)+" "+(pc.db_scale(data.rh100[i].db+35)+20*i)+","+(pc.height+pc.rbmargin)+" "+(pc.width-pc.rbmargin)+","+pc.rbmargin+" "+xChiller+","+pc.rbmargin) 
								.attr("fill", "orange")
								.attr("fill-opacity", 0.2);
						
						}
					}
				}
			}
		}

		drawZones(wetBulb);


		/**************************************************
		*	Function : updateZones
		*	use      : used when the range input is moved, redraw the three areas using the new setpoint
		*	argument : the setpoint on the wetBulb line
		*	returns  : 
		**************************************************/
		d3.select("#wetBulb").on("input", function() {
		  updateZones(+this.value);
		});
		function updateZones(wetBulb){
			d3.select("#wetBulb-value").text(wetBulb);
			d3.selectAll("polygon").remove();
			drawZones(wetBulb);
		}
		
		
		/**************************************************
		*	Function : affichageLegendes
		*	use      : write the captions on the top-left corner
		*	argument : 
		*	returns  : 
		**************************************************/
		this.affichageLegendes = function(){
			//Ecritures légende
			d3.select("svg")  
			  .append("text")
				.text("Dry Cooler")
				.attr("id", "t1")
				.attr("opacity", 0.8)
				.attr("x", (pc.rbmargin+16))
				.attr("y", (pc.rbmargin+14))
				.attr("font-size", "15px")
				.attr("fill", "green")
				.on("mouseover", function() {
				  d3.select("#z1").style("fill-opacity", "0.5")
				  d3.select("#t1").style("opacity", "1")
				  d3.select("#c1").style("opacity", "1"); })
				.on("mouseout", function() {
				  d3.select("#z1").style("fill-opacity", "0.2")
				  d3.select("#t1").style("opacity", "0.5")
				  d3.select("#c1").style("opacity", "0.5"); });
			d3.select("svg") 
			  .append("text")
				.text("Evaporative Tower")
				.attr("id", "t2")
				.attr("opacity", 0.8)
				.attr("x", (pc.rbmargin+16))
				.attr("y", (pc.rbmargin+31))
				.attr("font-size", "15px")
				.attr("fill", "blue")
				.on("mouseover", function() {
				  d3.select("#z2").style("fill-opacity", "0.5")
				  d3.select("#t2").style("opacity", "1")
				  d3.select("#c2").style("opacity", "1"); })
				.on("mouseout", function() {
				  d3.select("#z2").style("fill-opacity", "0.2")
				  d3.select("#t2").style("opacity", "0.5")
				  d3.select("#c2").style("opacity", "0.5"); });
			d3.select("svg") 
			  .append("text")
				.text("Chiller")
				.attr("id", "t3")
				.attr("opacity", 0.8)
				.attr("x", (pc.rbmargin+16))
				.attr("y", (pc.rbmargin+48))
				.attr("font-size", "15px")
				.attr("fill", "orange")
				.on("mouseover", function() {
				  d3.select("#z3").style("fill-opacity", "0.5")
				  d3.select("#t3").style("opacity", "1")
				  d3.select("#c3").style("opacity", "1"); })
				.on("mouseout", function() {
				  d3.select("#z3").style("fill-opacity", "0.2")
				  d3.select("#t3").style("opacity", "0.5")
				  d3.select("#c3").style("opacity", "0.5"); });
		
			//Carrés légende
			d3.select("svg")
			  .append("rect")
			  	.attr("id", "c1")
				.attr("x", pc.rbmargin)
				.attr("y", pc.rbmargin)
				.style("fill", "green")
				.attr("opacity", 0.5)
				.attr("height", 15) 
				.attr("width", 15)
				.on("mouseover", function() {
				  d3.select("#z1").style("fill-opacity", "0.5")
				  d3.select("#t1").style("opacity", "1")
				  d3.select("#c1").style("opacity", "1"); })
				.on("mouseout", function() {
				  d3.select("#z1").style("fill-opacity", "0.2")
				  d3.select("#t1").style("opacity", "0.5")
				  d3.select("#c1").style("opacity", "0.5"); });
			d3.select("svg") 
			  .append("rect")
				.attr("id", "c2")
				.attr("x", pc.rbmargin)
				.attr("y", (pc.rbmargin+17))
				.style("fill", "blue")
				.attr("opacity", 0.5)
				.attr("height", 15) 
				.attr("width", 15)
				.on("mouseover", function() {
				  d3.select("#z2").style("fill-opacity", "0.5")
				  d3.select("#t2").style("opacity", "1")
				  d3.select("#c2").style("opacity", "1"); })
				.on("mouseout", function() {
				  d3.select("#z2").style("fill-opacity", "0.2")
				  d3.select("#t2").style("opacity", "0.5")
				  d3.select("#c2").style("opacity", "0.5"); }); 
			d3.select("svg") 
			  .append("rect")
			  	.attr("id", "c3")
				.attr("x", pc.rbmargin)
				.attr("y", (pc.rbmargin+34))
				.style("fill", "orange")
				.attr("opacity", 0.5)
				.attr("height", 15) 
				.attr("width", 15)
				.on("mouseover", function() {
				  d3.select("#z3").style("fill-opacity", "0.5")
				  d3.select("#t3").style("opacity", "1")
				  d3.select("#c3").style("opacity", "1"); })
				.on("mouseout", function() {
				  d3.select("#z3").style("fill-opacity", "0.2")
				  d3.select("#t3").style("opacity", "0.5")
				  d3.select("#c3").style("opacity", "0.5"); });
		}
		affichageLegendes();


		/**************************************************
		*	Function : 
		*	use      : draw the axis, their captions and titles
		*	argument : 
		*	returns  : 
		**************************************************/
		d3.select("svg")
		  .append("g")
			.attr("class", "db axis")
			.attr("id", "db-axis-C")
			.attr("transform", "translate(0," + (pc.height - pc.rbmargin) + ")")
			.call(db_axis)

		d3.select("svg")
		  .append("g")
			 .attr("class", "db axis")
			 .attr("id", "db-axis-F")
			 .attr("opacity", "0")
			 .attr("transform", "translate(0," + (pc.height - pc.rbmargin) + ")")
			 .call(db_axis_F)

		d3.select("svg")
		  .append("g")
			.attr("class", "hr axis")
			.attr("transform", "translate(" + (pc.width - pc.rbmargin) + ",0)")
			.call(hr_axis)

		d3.select("#db-axis-C")
		  .append("text")
			.text("Drybulb Temperature [°C]")
			  .attr("id", "db-unit")
			  .attr("x", (pc.width / 2) - 1.9 * pc.margin)
			  .attr("y", pc.rbmargin / 1.3)

		d3.select("#db-axis-F")
		  .append("text")
			.text("Drybulb Temperature [°F]")
			  .attr("id", "db-unit")
			  .attr("x", (pc.width / 2) - 1.9 * pc.margin)
			  .attr("y", pc.rbmargin / 1.3)

		d3.select(".hr.axis")
		  .append("text")
			.attr("id", "hr-text")
			.attr("transform", "rotate (-90, -43, 0) translate(-360,90)")
		  .append("tspan")
			.text("Humidity Ratio [g")
			.attr("id", "hr-unit0")

		d3.select("#hr-text")
		  .append("tspan")
			.text("w")
			.style("baseline-shift", "sub")

		d3.select("#hr-text")
		  .append("tspan")
			.text(" / kg")
			.attr("id", "hr-unit1")

		d3.select("#hr-text")
		  .append("tspan")
			.text("da")
			.style("baseline-shift", "sub")

		d3.select("#hr-text")
		  .append("tspan")
			.text("]")
	}
  

	/**************************************************
	*	Function : CALCULATION PART THREE
	*	use      : used to draw the chart
	*	argument : 
	*	returns  : 
	**************************************************/
	this.getHumRatio = function(db, rh) {
		return psy.humratio(psy.PROP.Patm, rh * psy.satpress(db) / 100)
	}

	this.findComfortBoundary = function(d, pmvlimit) {
		var boundary = []

		function solve(rh, target){
			var epsilon = 0.001
			var a = 0
			var b = 100
			var fn = function(db){
				return pmvElevatedAirspeed(db, d.tr, d.vel, rh, d.met, d.clo, d.wme)[0][0]
			}
			t = psy.bisect(a, b, fn, epsilon, target)
			return {"db": t, "hr": pc.getHumRatio(t,rh)}
		}

		for (rh = 0; rh <= 100; rh += 10){
			boundary.push(solve(rh, -pmvlimit))
		}
		while (true){
			t += 0.5
			boundary.push({"db": t, "hr": pc.getHumRatio(t,100)})
			if (pmvElevatedAirspeed(t, d.tr, d.vel, rh, d.met, d.clo, d.wme)[0][0] > pmvlimit) break
		}
		for (rh = 100; rh >= 0; rh -= 10){
			boundary.push(solve(rh, pmvlimit))
		}
		return boundary
	}


	/**************************************************
	*	Function : setupChart
	*	use      : draw the chart using data given
	*	argument : given values for the creation of the chart
	*	returns  : 
	**************************************************/
	this.setupChart = function(d){
		d3.json('assets/bower_components/psych-chart-d3/data/rh-curves.json', pc.drawChart)
		var json = [{"db": d.ta, "hr": pc.getHumRatio(d.ta, d.rh)}]
		var b = pc.findComfortBoundary(d,0.5)
		//setTimeout(function(){pc.drawComfortRegion(b)}, 10)
		//setTimeout(function(){pc.drawPoint(json)}, 10)
	}



	/**************************************************
	*	Function : toggleUnits
	*	use      : write the title of the axis
	*	argument : 
	*	returns  : 
	**************************************************/
	this.toggleUnits = function(isCelsius) {
		if (isCelsius){
			d3.select("#db-axis-C").attr("opacity", "100")
			d3.select("#db-axis-F").attr("opacity", "0")
			document.getElementById('hr-unit0').textContent = "Humidity Ratio [g"
			document.getElementById('hr-unit1').textContent = "/ kg"
		}else{
			d3.select("#db-axis-C").attr("opacity", "0")
			d3.select("#db-axis-F").attr("opacity", "100")
			document.getElementById('hr-unit0').textContent = "Humidity Ratio [lb"
			document.getElementById('hr-unit1').textContent = "/ klb"
		}
	}

}
