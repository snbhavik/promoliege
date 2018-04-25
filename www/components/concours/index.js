'use strict';

app.concours = kendo.observable({
    beforeShow: function(){
       // SCROLL TOP IF NECESSARY
        if(app.concours.concoursModel.scrollTop){
			$('#concoursView .km-content').data("kendoMobileScroller").reset();  
        }else{
            app.concours.concoursModel.scrollTop=true;
        }

        app.concours.concoursModel.dataSource.read();
    },
    onShow: function(e) {
		// CACHER LE BOUTON DE RETOUR
        $('#retour img,#launchCategories').addClass('hidden');
    },
    afterShow: function() {
         
    }
});

(function(parent) {
    var dataProvider = app.data.promosLiegeBackend,
        processImage = function(img) {
            if (!img) {
                var empty1x1png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQI12NgYAAAAAMAASDVlMcAAAAASUVORK5CYII=';
                img = 'data:image/png;base64,' + empty1x1png;
            } else if (img.slice(0, 4) !== 'http' &&
                img.slice(0, 2) !== '//' &&
                img.slice(0, 5) !== 'data:') {
                var setup = dataProvider.setup;
                img = setup.scheme + ':' + setup.url + setup.apiKey + '/Files/' + img + '/Download';
            }
            return img;
        },
        flattenLocationProperties = function(dataItem) {
            var propName, propValue,
                isLocation = function(value) {
                    return propValue && typeof propValue === 'object' &&
                        propValue.longitude && propValue.latitude;
                };
            for (propName in dataItem) {
                if (dataItem.hasOwnProperty(propName)) {
                    propValue = dataItem[propName];
                    if (isLocation(propValue)) {
                        // Location type property
                        dataItem[propName] =
                            kendo.format('Latitude: {0}, Longitude: {1}',
                                propValue.latitude, propValue.longitude);
                    }
                }
            }
        },
        dataSourceOptions = {
            type: 'everlive',
            transport: {
                typeName: 'concours',
                dataProvider: dataProvider
            },
            change: function(e) {
				// console.log('change concours');
                var data = this.data();
				var activeConcours=0;

                for (var i = 0; i < data.length; i++) {
                    var dataItem = data[i];
                    flattenLocationProperties(dataItem);
					dataItem.imageUrl = app.concours.processImage(dataItem.image);
					if(!dataItem.image){
						dataItem.withImage='';
						dataItem.hideImage=' hideImage';
					}else{
						dataItem.withImage=' withImage';
						dataItem.hideImage='';
					}
					dataItem.date1 = dataItem.du.getDate()+'/'+(dataItem.du.getMonth()+1)+'/'+dataItem.du.getFullYear();
					dataItem.date2 = dataItem.au.getDate()+'/'+(dataItem.au.getMonth()+1)+'/'+dataItem.au.getFullYear();

					var now=new Date();
					if (now.getTime() > dataItem.au.getTime()) {
						dataItem.cta="Voir les gagnants";
						dataItem.ctaClass="";
					}else{
						activeConcours++;
						dataItem.cta="Jouer";
						dataItem.ctaClass=" jouer";
					}
					
                }
				$(".concoursCounter").html(activeConcours);
               
                // LOADER
                $('#concoursView .mikoLoader').hide();
            },
            schema: {
                model: {
                    id: "Id",
                    fields: {
                        'titre': {
                            field: 'titre',
                            defaultValue: ''
                        }
                    }
                }
            },
             /*
            filter: {
                "field": "commercant_nom",
                "operator": "contains",
                "value": "hjgh"
           },*/
            serverSorting: false,
 			sort: { field: "du", dir: "desc" },
            serverPaging: false,
            pageSize: 500
        },
        dataSource = new kendo.data.DataSource(dataSourceOptions),
        concoursModel = kendo.observable({
            dataSource: dataSource,
            currentItem: null,
            scrollTop : true
        });
    parent.set('concoursModel', concoursModel);
    parent.set('processImage', processImage);
})(app.concours);

function launchConcours(e){
	var data = e.button.data();
	window.open(data.url, '_system');
}