'use strict';

app.evenements = kendo.observable({
    beforeShow: function(){
       // SCROLL TOP IF NECESSARY
        if(app.evenements.evenementsModel.scrollTop){
			app.evenements.evenementsModel.dataSource.read();
            $('#evenementsView .km-content').data("kendoMobileScroller").reset();  
        }else{
            app.evenements.evenementsModel.scrollTop=true;
        }
    },
    onShow: function(e) {
		// CACHER LE BOUTON DE RETOUR
        $('.menutop').show();
        $('.btnretour img,#launchCategories').addClass('hidden');
    },
    afterShow: function() {
         $('#menutop').show();
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
        dataSourceOptions = {
            transport: {
                read: function(promiseResultat){
                    if(isProductionApp){
                        var urlEvenements ='https://promoliege.com/get_evenements/0';
                    }else{
                        var urlEvenements ='https://promoliege.mikodigital.com/get_evenements/0/?test=1';
                    }
                    $.get(urlEvenements,{},function(returns){
                        promiseResultat.success(returns);                         
                    },'json');
                }
            } ,

            requestEnd: function(e) {
                    
            },
            change: function(e) {
                    
                    var data = this.data();
                    
                    for (var i = 0; i < data.length; i++) {
                        var dataItem = data[i];
                        dataItem.image = app.evenements.processImage(dataItem.imageUrl);
                        if(!dataItem.imageUrl){
                            dataItem.withImage='';
                            dataItem.hideImage=' hideImage';
                        }else{
                            dataItem.withImage=' withImage';
                            dataItem.hideImage='';
                        }
                        dataItem.au = new Date(dataItem.date_au).getDate()+'/'+(new Date(dataItem.date_au).getMonth()+1)+'/'+new Date(dataItem.date_au).getFullYear();
                        dataItem.du = new Date(dataItem.date_du).getDate()+'/'+(new Date(dataItem.date_du).getMonth()+1)+'/'+new Date(dataItem.date_du).getFullYear();        
                    }
                    // LOADER
                    $('#evenementsView .mikoLoader').hide();
            },
            serverSorting: false ,
            serverPaging: false,
            pageSize: 500
        },
        dataSource = new kendo.data.DataSource(dataSourceOptions),
        evenementsModel = kendo.observable({
            dataSource: dataSource,
            currentItem: null,
            scrollTop : true ,
            itemClick: function(e) {
                e.preventDefault();
                app.mobileApp.navigate('#components/evenements/details.html?uid=' + e.dataItem.uid);
            },
            detailsBeforeShow: function(){
               
               $('#launchCategories').addClass('hidden');
               $('#unEvenement .km-content').data("kendoMobileScroller").reset();  
               
               $('.menutop').hide();
                
               $("#detailUnEvt").kendoTouch({
                    enableSwipe: true,
                    swipe: function(e) {
                       app.mobileApp.navigate("#:back");
                    }
                });
            },
            detailsShow: function(e) {
                
                 // MONTRER ET CENTRER LE BOUTON DE RETOUR
                var totalWidth=$('header').width();
                var logoWidth='202';
                var flecheWidth='12';
                $('#kendoUiMobileApp #retour').css('padding-left',(((totalWidth-logoWidth)/2)-flecheWidth)/2);
                $('.btnretour img').removeClass('hidden');
                $('.menutop').hide();

                dataSource = evenementsModel.get('dataSource');
                var itemModel;
                // TELL PROMOTIONS VIEW NOT TO SCROLL TOP WHEN COMING BACK
                evenementsModel.set('scrollTop', false);
                
                
                if(e.view.params.uid){
                    $('#unEvenement .mikoLoader').hide();
                    var item = e.view.params.uid,
                    itemModel = dataSource.getByUid(item);
                    app.evenements.evenementsModel.set('currentItem', itemModel);
                    console.log(itemModel);
                    if(itemModel.description=="" ||  itemModel.description==null){
                        $('#unEvenement .description').hide();
                    }else{
                        $('#unEvenement .description').show();
                    }
                };
            }
        });
    parent.set('evenementsModel', evenementsModel);
    parent.set('processImage', processImage);
})(app.evenements);

function onTapEvt(e){
    var uid = $(e.touch.target).attr('data-promotion-uid');
    app.mobileApp.navigate('#components/evenements/details.html?uid=' + uid);
}
function launchWebEvt(){
   window.open(app.evenements.evenementsModel.currentItem.url, '_system');
}