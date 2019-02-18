/**
 * ---------------------------------------
 * This demo was created using amCharts 4.
 *
 * For more information visit:
 * https://www.amcharts.com/
 *
 * Documentation is available at:
 * https://www.amcharts.com/docs/v4/
 * ---------------------------------------
 */

// ecco

function readSelectors() {
  var tip_cliente = $('#tip_cliente').val();
  var mercato = $('#mercato').val();
  var anno = $('#anno').val();
  var anno_slider = $('#slider-anno').val();

  // se vuoi i testi:
  // var tip_cliente = $('#tip_cliente option:selected').html();
  // var mercato = $('#mercato option:selected').html();
  // var anno = $('#anno option:selected').html();

  // return { 'tip_cliente': tip_cliente, 'mercato': mercato, 'anno': anno}
  return { 'tip_cliente': tip_cliente, 'mercato': mercato, 'anno': anno_slider}
}

function filename() {
  var sel = readSelectors();
  var fnm = [sel.tip_cliente, sel.mercato, sel.anno].join('_');
  return fnm;
}


labelHash = {
  "bt_dom": "BT domestici",
  "bt_altri": "BT altri usi",
  "magg_tutela": "Maggior tutela",
  "mercato_lib": "Mercato libero",
  "salvaguardia": "Salvaguardia"
}

function decodeLabel(code) {
  var string = labelHash[code];
  if (string == null) {
    return "Undefined ("+code+")";
  } else {
    return labelHash[code];
  }
}

function normlz(string) {
  return string.toLowerCase().split(' ').join('_');
}



function buildSelectorL1(h=Arera.hash, currSelL1=Object.keys(h)[0]) {
  $('#tip_cliente').empty();
  for (var k in h) {
    $('#tip_cliente').append("<option value="+k+">"+h[k].text+"</option>");
  }
  $('#tip_cliente').val(currSelL1);
  buildSelectorL2(h[currSelL1].chld); // Potrei passare solo l'albero da qui in giù...
}

function buildSelectorL2(h, currSelL2=Object.keys(h)[0]) {
  $('#mercato').empty();
  for (var k in h) {
    $('#mercato').append("<option value="+k+">"+h[k].text+"</option>");
  }
  $('#mercato').val(currSelL2);
  buildSelectorL3(h[currSelL2].chld);
}

function buildSelectorL3(arr, currSelL3=arr[0]) {
  $('#anno').empty();
  for (var idx in arr) {
    $('#anno').append("<option value="+arr[idx]+">"+arr[idx]+"</option>");
  }
  $('#anno').val(currSelL3);
}


function buildSelectors(h) {
  buildSelectorL1(h);
}

function refreshSelectors(params) {
  $('#tip_cliente').html("");
}

// Ricostruisce l'albero delle categorie
// -------------------------------------
// { 'bt_dom': {
//     'text': 'BT domestici',
//     'chld': {
//       'magg_tutela': {
//         'text': 'Maggior tutela',
//         'chld': ['2012', '2013', ...]
//       },
//       'mercato_lib': {
//         'text': 'Mercato libero',
//         'chld': ['2012', '2013', ...]
//       }
//     }
//   }
// }
function readDataStruct(array) {
  var hash = {};
  $.each(array, function(idx, el){
    var key1 = el.tip_cliente
    var txt1 = decodeLabel(key1);
    if (!hash.hasOwnProperty(key1)) {
      hash[key1] = { 'text': txt1, 'chld': {}};
    }
    var key2 = el.mercato;
    var txt2 = decodeLabel(key2);
    if (!hash[key1].chld.hasOwnProperty(key2)) {
      hash[key1].chld[key2] = { 'text': txt2, 'chld': []};
    }
    if (!hash[key1].chld[key2].chld.includes(el.anno)) {
      hash[key1].chld[key2].chld.push(el.anno);
    }
  });
  Arera.hash = hash;
  buildSelectors(hash);
}

// function drawMap(polygonSeries) {
//   polygonSeries.data = readData();
// }

function filterRegDataBySelectors(selectors=readSelectors()) {
  return reg_data({tip_cliente: selectors.tip_cliente, mercato: selectors.mercato, anno: parseInt(selectors.anno)}).get();
}

function filterProvDataBySelectors(selectors=readSelectors()) {
  return prov_data({tip_cliente: selectors.tip_cliente, mercato: selectors.mercato, anno: parseInt(selectors.anno)}).get();
}

function drawMapAndTable(polygonSeries) {
  // var filteredData = filterDataBySelectors();
  var filteredRegData  = filterRegDataBySelectors();
  var filteredProvData = filterProvDataBySelectors();

  // console.log("======================");
  // console.log(filteredRegData.length);
  // console.log(filteredRegData);
  // console.log("----------------------");
  // console.log(filteredProvData.length);
  // console.log(filteredProvData);
  // console.log("======================");


  $('#selected-anno').html(filteredRegData[0].anno);
  // polygonSeries.data = filteredData;
  polygonSeries.data = JSON.parse(JSON.stringify(filteredProvData));
  $('#table tbody').empty();
  $.each(filteredRegData, function(idx, h){
    var v = Math.round(h.value * 10.0) / 10.0;
    var s = v.toString();
    if (!s.includes('.')) {
      s = s + ".0";
    }
    $('#table tbody').append("<tr><td class='name'>"+h.nome_reg+"</td><td class='val'>"+s+" %</td></tr>");
  })
}


function download_csv() {
  var csv = 'Regione,Tip_cliente,Mercato,Anno,Valore\n';
  // {"id":"IT-65","regione":"Abruzzo","tip_cliente":"bt_dom","anno":2012,"mercato":"magg_tutela","value":80.9}
  reg_data().get().forEach(function(h) {
    csv += [h.nome_reg, h.tip_cliente, h.mercato, h.anno, h.value].join(',');
    csv += "\n";
  });

  console.log(csv);
  var hiddenElement = document.createElement('a');
  hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
  hiddenElement.target = '_blank';
  hiddenElement.download = 'dati_arera.csv';
  hiddenElement.click();
}
// --------------------------------
// --------------------------------

// Create map instance
var chart = am4core.create("map", am4maps.MapChart);

// Set map definition
// chart.geodata = am4geodata_italyLow;
// chart.geodataSource.url = "https://gist.githubusercontent.com/datajournalism-it/212e7134625fbee6f9f7/raw/dabd071fe607f5210921f138ad3c7276e3841166/province.geojson";
// chart.geodataSource.url = "https://raw.githubusercontent.com/isellsoap/deutschlandGeoJSON/master/1_deutschland/1_sehr_hoch.geojson";
// chart.geodataSource.url = "https://raw.githubusercontent.com/isellsoap/deutschlandGeoJSON/master/2_bundeslaender/3_mittel.geojson";
// chart.geodataSource.url = "https://gist.githubusercontent.com/datajournalism-it/48e29e7c87dca7eb1d29/raw/2636aeef92ba0770a073424853f37690064eb0ea/regioni.geojson";

// chart.geodataSource.url = "https://gist.githubusercontent.com/iwan/b261f6f7ba99ea5db97cc9c31db1d8ad/raw/2f557395a203488d46e632326e3485434f2459a7/cinque_province.geojson";
// chart.geodataSource.url = "https://gist.githubusercontent.com/iwan/0b0ba69311cfe266025786046647d5f1/raw/7efc3a7538ec2c0272234b030399bb3f6d0e57e1/cinque_province_senza_id.geojson";

chart.geodataSource.url = "https://gist.githubusercontent.com/iwan/ea6ef02404f40d64f4d8093d07a6e68f/raw/aed6e8fcfa3411163276872c0271f401201bf50a/province.geojson";




// Set projection
chart.projection = new am4maps.projections.Miller();

// Create map polygon series
var polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());

// Make map load polygon (like country names) data from GeoJSON
polygonSeries.useGeodata = true;

// Configure series
var polygonTemplate = polygonSeries.mapPolygons.template;
polygonTemplate.tooltipText = "{nome_prov}: {value}%";
polygonTemplate.fill = am4core.color("#999");

// Create hover state and set alternative fill color
var hs = polygonTemplate.states.create("hover");
hs.properties.fill = am4core.color("#797979");

// Remove Antarctica
// polygonSeries.exclude = ["FR-H", "MT", "VA", "SM"];


// Add heat rule
polygonSeries.heatRules.push({
  "property": "fill",
  "target": polygonSeries.mapPolygons.template,
  "min": am4core.color("#ffffff"),
  "max": am4core.color("#8f0000"),
  "minValue": 0.0,
  "maxValue": 100.0
});

Arera = {};
readDataStruct(reg_data().get());


var anni = reg_data().distinct('anno').sort();
var anno_0 = anni[0];
var anno_1 = anni[anni.length-1];
$('#slider-anno').attr('min', anno_0);
$('#slider-anno').attr('max', anno_1);
$.each(anni, function(idx, y){
  $('#tickmarks').append("<option value='"+y+"' label='"+y+"'>");
});

drawMapAndTable(polygonSeries);


$('document').ready(function() {
    // $('.map_dropdown').change(function(){
    $('#download_data').on('click', function(){
      download_csv();
    })


    $('.map_dropdown').on('input', function(){

    var t0 = performance.now();

    var level_changed = $(this).attr('id'); // id del dropdown (<select> tag) che è stato cambiato
    // 'tip_cliente', 'mercato', 'anno'
    var value = $(this).val(); // 'mercato_lib'

    if (level_changed=='tip_cliente') {
      buildSelectorL2(Arera.hash[value].chld);

    } else if (level_changed=='mercato') {
      var tip_cliente = $('#tip_cliente').val();
      buildSelectorL3(Arera.hash[tip_cliente].chld[value].chld);
    }
    drawMapAndTable(polygonSeries);
    var t1 = performance.now();
    console.log("Call took " + (t1 - t0) + " milliseconds.");
  })
})


// http://taffydb.com/working_with_data.html
