'use strict';

var currentCategorie=null;
var currentSpan=null;
var totalCategorie = 2 ;
var jsonPromotions = null ;
var fromDetail = false ;
//swip gestion
var nbShow = 3 ;
var span = 0 ;
var promiseProm;
var promiseCat;

app.promotions = kendo.observable({
    beforeShow: function(){

        if(app.promotions.promotionsModel.scrollTop){
            // SCROLL TOP IF NECESSARY
            $('#promotionsView .km-content').data("kendoMobileScroller").reset();
            // LIRE LES PROMOTIONS ET TRIER PAR FAVORIS (uniquement si on ne reviens pas de la vue details.html)
            promiseProm = app.promotions.promotionsModel.dataSource.read();
        }else{
            app.promotions.promotionsModel.scrollTop=true;
        }

        app.promotions.concours.concoursModel.dataSource.fetch().then(function(){
           
        });
        promiseCat = app.categories.categoriesModel.dataSource.read();
        fromDetail = false ;

    },
    onShow: function(e) {
        // CACHER LE BOUTON DE RETOUR
        $('.btnretour img').addClass('hidden');
        $('header #launchCategories').removeClass('hidden');
        $('.menutop').show();

        span = 0 ;
        $("#menu-haut-promotions").html(' <span data-id="promotion" class="active span0">Promotions <b></b></span><span data-id="concours" class="span1">Concours <b></b></span>');
        Promise.all([promiseProm,promiseCat]).then(function(){
            var datanb = app.promotions.promotionsModel.dataSource.data().length;
            $('.span0 b').text("("+datanb+")");
            
            if(jsonPromotions!=null){
                localStorage.setItem("promotions",JSON.stringify(jsonPromotions));
                var dataToCompile = [] ;
                var data = app.categories.categoriesModel.dataSource.data();
                for(var i =0 ; i < data.length ; i++){
                    if(jsonPromotions.categories[data[i]['Id']]){
                        if(jsonPromotions.categories[data[i]['Id']]['secondaire']==true){
                            dataToCompile.push(data[i]);
                        }
                    }
                }
                totalCategorie = dataToCompile.length + 2 ;
                var template = kendo.template($("#lienTemplate").html());
                var result = template(dataToCompile);
                $("#menu-haut-promotions").append(result);
                for(var i =0 ; i < data.length ; i++){
                    if(jsonPromotions.categories[data[i]['Id']]){
                        $('span[data-id="'+data[i]['Id']+'"]').find("b").text("("+jsonPromotions.categories[data[i]['Id']]['count']+")");
                        if(jsonPromotions.categories[data[i]['Id']]['secondaire']==false){
                            $('span[data-id="'+data[i]['Id']+'"]').remove();
                        }
                    }
                }
            }

            if(currentCategorie!=null && currentSpan!=null){
                for( var j = 0 ; j < currentSpan ; j++){
                    $('.span'+j).hide();                  
                }
                $('.span0').removeClass('active');
                span = currentSpan - 1;
                _swipe("left",span,currentSpan)
            }

        });
        $("#menu-haut-promotions").show();

        
        
        $("#promotionsView").kendoTouch({
                enableSwipe: true,
                swipe: function(e) {

                    var direction = e.direction; 
                    var noAction = false ;
                    var noShow = false ;
                    
                    if(direction=="left" && span!=(totalCategorie-1)){

                        var nextShow = (span + nbShow) ;
                        var nextSpan = (span + 1) % totalCategorie ;
                        
                        noAction = true ;
                        if(nextShow < totalCategorie ){
                            noShow = true ;
                        }
                    }


                    if(direction=="right" && span!=0){

                        var nextShow = (span - nbShow + 2)  ;
                        var nextSpan = (span - 1) % totalCategorie ;
                        
                        if(nextSpan < 0){
                            nextSpan = totalCategorie + nextSpan ;
                        }
                        if(nextShow < 0){
                            nextShow = totalCategorie + nextShow ;
                        }

                        noAction = true ;

                        if(nextShow > nbShow ){
                            noShow = true ;
                            
                        }
                    }

                    if(noAction ==true){
                        _swipe(direction,span,nextSpan);
                    }

                    if(noShow==true){
                        $('.span'+nextShow).show();
                    }

                    if(nextShow==0){
                        currentSpan = null ;
                        currentCategorie = null ;
                    }                    
                    

                }
            });
       // TRI PAR CATEGORIE
       if(!e.view.params.cat_id){
            // SHOW ALL
            this.model.promotionsModel.dataSource.filter(null);
       }else{
            // FILTER
            currentCategorie=e.view.params.cat_id;
            this.model.promotionsModel.dataSource.filter({
               "field": "categorie",
               "operator": "equals",
               "value": e.view.params.cat_id
            });
            // STOCKER LES PROMOTIONS VUES
            var categories=app.categories.categoriesModel.dataSource.data();
            var mycat;
            for (var i = 0; i < categories.length; i++) {
                var cat = categories[i];
                if(cat.Id==currentCategorie){
                    mycat=cat;
                }
            }
            if(typeof mycat !== 'undefined' && mycat.promotions_ids){
                var viewedPromotions = localStorage.getItem("viewedPromotions");
                if(!viewedPromotions){viewedPromotions=new Array();}else{viewedPromotions = JSON.parse(viewedPromotions);};
                for (var i = 0; i < mycat.promotions_ids.length; i++) {
                    var id=mycat.promotions_ids[i];
                    var index=viewedPromotions.indexOf(id);
                    if(-1 == index){
                        viewedPromotions.push(id);
                    }
                }
                localStorage.setItem("viewedPromotions", JSON.stringify(viewedPromotions));
                $('#categorie_'+currentCategorie+' .new').addClass('hidden');
            }
       }

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
        sortByFavorite = function(){
            // console.log('sort');
            //app.promotions.promotionsModel.dataSource.sort([{ field: "interested", dir: "desc" },{ field: "CreatedAt", dir: "desc" }]);    
        },
        dataSourceOptions = {
            transport: {
                read: function(promiseResultat){
                    if(isProductionApp){
                        var urlPromotion='https://promoliege.com/get_promos/0';
                    }else{
                        var urlPromotion='https://promoliege.mikodigital.com/get_promos/0/?test=1';
                    }
                    $.get(urlPromotion,{},function(returns){
                        jsonPromotions = returns ;
                        var current = returns.promos;
                        var promise = new Promise(function(resolve,reject){
                            var reglages = localStorage.getItem("reglages");
                            if(!reglages){
                                app.reglages.reglagesModel.dataSource.fetch(function(){
                                        resolve(this.data());
                                }); 
                            }else{
                                resolve(JSON.parse(reglages));
                            }
                        });

                        promise.then(function(data) {
                            var output = [] ;
                            var other = [] ; 
                            for(var i = 0 ; i < current.length ; i++ ){
                                if(data.indexOf(current[i]['categorie'])>-1){
                                    output.push(current[i]);
                                }else{
                                    other.push(current[i]);
                                }
                            }
                            var full = output.concat(other);
                            console.log(full);
                            promiseResultat.success(full);                 
                        },function(){
                            promiseResultat.error({});
                        });        
                    },'json');
                }
            },            
            requestEnd: function(e) {
                
            },
            change: function(e) {
                //console.log('change promotions');
                 
                var data = this.data();
                //remove tmp document.getElementById("promosCounter").textContent=data.length;

                var reglages = localStorage.getItem("reglages");
                if(!reglages){reglages=new Array();}else{reglages = JSON.parse(reglages);};

                for (var i = 0; i < data.length; i++) {
                    var dataItem = data[i];
                    flattenLocationProperties(dataItem);
                    dataItem.imageUrl = app.promotions.processImage(dataItem.imageUrl);
                    if(!dataItem.imageUrl){
                        dataItem.withImage='';
                        dataItem.hideImage=' hideImage';
                    }else{
                        dataItem.withImage=' withImage';
                        dataItem.hideImage='';
                    }
                    var id=dataItem.categorie;
                    var index=reglages.indexOf(id);
                    if(-1 == index){
                       dataItem.interested='';
                    }else{
                       dataItem.interested=' interested';
                    }
                }
                // app.promotions.sortByFavorite();
                
                // console.log('end');
                // LOADER
                $('#promotionsView .mikoLoader').hide();
            },
            // schema: {
            //     model: {
            //         id: "Id",
            //         fields: {
            //             'nom': {
            //                 field: 'nom',
            //                 defaultValue: ''
            //             }
            //         }
            //     }
            // },
             /*
            filter: {
                "field": "commercant_nom",
                "operator": "contains",
                "value": "hjgh"
           },*/
            serverSorting: false,
            // sort: '{ field: "interested", dir: "desc" },{ field: "CreatedAt", dir: "asc" }',
            //  sort: { field: "CreatedAt", dir: "desc" },

            //  sort : [
            //  // sort by "category" in descending order and then by "name" in ascending order
            //  { field: "interested", dir: "asc" },
            //  { field: "CreatedAt", dir: "desc" }
            // ],

            serverPaging: false,
            pageSize: 500
        },
        dataSource = new kendo.data.DataSource(dataSourceOptions),
        promotionsModel = kendo.observable({
            dataSource: dataSource,
            itemClick: function(e) {
                e.preventDefault();
                app.mobileApp.navigate('#components/promotions/details.html?uid=' + e.dataItem.uid);
            },
           detailsBeforeShow: function(){
               fromDetail = true ; 
               $('#launchCategories').addClass('hidden');
               $('#unePromo .km-content').data("kendoMobileScroller").reset();  
               $('.menutop').hide();

               $(".detailUnePromo").kendoTouch({
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
                $('#kendoUiMobileApp .btnretour').css('padding-left',(((totalWidth-logoWidth)/2)-flecheWidth)/2);
                $('.btnretour img').removeClass('hidden');

                dataSource = promotionsModel.get('dataSource');
                var itemModel;
                // TELL PROMOTIONS VIEW NOT TO SCROLL TOP WHEN COMING BACK
                promotionsModel.set('scrollTop', false);
                // HIDE IMAGE
                $('.details #imageContainer').hide();
                $('#connectezVousAInternet').hide();
                if(e.view.params.uid){
                    $('#unePromo .mikoLoader').hide();
                    var item = e.view.params.uid,
                    itemModel = dataSource.getByUid(item);
                    printMyPromotion(itemModel);
                }else{
                    if(e.view.params.wpReference){
                        $('#unePromo .mikoLoader').show();
                        $('#unePromo .details').hide();
                        dataSource.read().then(function() {
                            var data = dataSource.data();
                            for (var i = 0; i < data.length; i++) {
                                var dataItem = data[i];
                                if(e.view.params.wpReference==dataItem.wp_reference){
                                    itemModel =new kendo.data.ObservableObject(dataItem);
                                }
                            }
                            $('#unePromo .mikoLoader').hide();
                            $('#unePromo .details').show();
                            printMyPromotion(itemModel);
                        });
                    }
                };
				 // cacher le prix si c est pas un deal
				if(itemModel.deal_url){
					$('#detailsViewPrix').show();
				}else{
					$('#detailsViewPrix').hide();
				}
				
            },
            currentItem: null,
            scrollTop : true
        });
    parent.set('promotionsModel', promotionsModel);
    parent.set('processImage', processImage);
     parent.set('sortByFavorite', sortByFavorite);
})(app.promotions);

//Build concours kendo Observable
app.promotions.concours = kendo.observable({});
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
                
                $('.span1 b').text("("+activeConcours+")");               
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
})(app.promotions.concours);



function printMyPromotion(itemModel){
    console.log(itemModel);
    //slisk galerie
    if($('#imageContainer').hasClass('slick-initialized')){
        $("#imageContainer").slick("destroy");
    }

    $('.bouton-acheter-container').hide();
    $('.bouton-dispo-container').hide();
    $('.bouton-acheter-container').unbind('click');

    if(itemModel['deal_url']!=""){
        $('.bouton-acheter-container').show();
        $('.bouton-acheter-container').on('click',function(){
            window.open(itemModel['deal_url'], '_system');
        });
    }else{
        $('.bouton-dispo-container').show();
    }

    if(itemModel.galerie){
        var htmlGalerie = "" ;
        if(itemModel.imageUrl){
            htmlGalerie = "<img id=\"promoImage\"src='"+itemModel.imageUrl+"'/>" ;
        }
        for(var j = 0 ;j < itemModel.galerie.length ; j++){
            htmlGalerie = htmlGalerie + "<img src='"+itemModel.galerie[j]+"'/>" ;
        }
        $('#imageContainer').html(htmlGalerie);
        $("#imageContainer").slick({
            dots: true,
            mobileFirst: true,
            centerMode: false,
            slidesToShow: 1 ,
            variableWidth: false ,
            adaptiveHeight : true ,
            lazyLoad : 'progressive' 
        });

        setTimeout(function(){
            $('#imageContainer').slick('setPosition');
        },1000);

    }else{
        var htmlGalerie = "" ;
        if(itemModel.imageUrl){
            htmlGalerie = "<img id=\"promoImage\"src='"+itemModel.imageUrl+"'/>" ;
        }     
        $('#imageContainer').html(htmlGalerie);   
    }

    if (!itemModel.commercant_nom){
        itemModel.commercant_nom = String.fromCharCode(160);
    }
    if(!itemModel.seen){
        var adressesFinales=[{adresse:itemModel.commercant_adresse, horaire:itemModel.commercant_horaire, telephone:itemModel.commercant_telephone}];
        if(itemModel.pdvs && itemModel.pdvs.length){
            var numberOfExtraAdresses=itemModel.pdvs.length;
            while (numberOfExtraAdresses > 0) {
                adressesFinales[numberOfExtraAdresses]=itemModel.pdvs[numberOfExtraAdresses-1];
                numberOfExtraAdresses--;
            };
        }
        itemModel.set('pdvs',adressesFinales);
        itemModel.set('seen',true);
    }
    app.promotions.promotionsModel.set('currentItem', itemModel);


    var isPromoImage = false ;
    if($('#promoImage').length>0){
        if(-1==$('#promoImage').attr('src').indexOf(itemModel.imageUrl)){
            isPromoImage = true ;
        }
    }

    if(isPromoImage){
        $('.details #promoImageLoader').hide();
        $('#connectezVousAInternet').show();
    }else{
        $('.details #promoImageLoader').hide();
        $('.details #imageContainer').show();
    }

    // GERER LIENS COMMERCANTS
    if(typeof itemModel.commercant_web !== "string" || ""== itemModel.commercant_web){
        $('#commercantWeb').hide();
    }else{
        $('#commercantWeb').show();
    }
    if(typeof itemModel.commercant_facebook !== "string" || ""== itemModel.commercant_facebook){
        $('#commercantFacebook').hide();
    }else{
        $('#commercantFacebook').show();
    }
     if(typeof itemModel.commercant_eshop !== "string" || ""== itemModel.commercant_eshop){
        $('#commercantShop').hide();
    }else{
        $('#commercantShop').show();
    }
    // GERER LIEN CONDITIONS
    if(itemModel.conditions_details==null){
        $('#conditionsLink').hide();
        $('#conditionsTexte').show();
    }else if('http://'==itemModel.conditions_details.substring(0, 7)){
        $('#conditionsLink').show();
        $('#conditionsTexte').hide();
    }else{
        $('#conditionsLink').hide();
        $('#conditionsTexte').show();
            
    }
    
    // GERER GOOGLE MAP
    $('.details .adresse').each(function(){
        $(this).attr('href',get_map_link($(this).attr('href')));
    });
}
function launchConditions(){
   window.open(app.promotions.promotionsModel.currentItem.conditions_details, '_system');
}
function launchWeb(){
   window.open(app.promotions.promotionsModel.currentItem.commercant_web, '_system');
}
function launchFacebook(){
   window.open(app.promotions.promotionsModel.currentItem.commercant_facebook, '_system');
}
function launchEshop(){
   window.open(app.promotions.promotionsModel.currentItem.commercant_eshop, '_system');
}
function launchFacebookShare(){
   window.plugins.socialsharing.share('Toutes vos promotions en une application!', null, null, 'https://www.promosliege.com');
}
function get_map_link(adresse){
    var link="";
/*<a href="maps://?q=dallas" data-rel="external">iOS launch in apple maps</a>
<a href="comgooglemaps://?q=dallas" data-rel="external">iOS launch in google maps</a>
<a href="geo://0,0?q=dallas" data-rel="external">Android launch in google maps</a>*/
    if ("android"==kendo.support.mobileOS.device) {        
        link='geo://0,0?q='+adresse;
    }else{
       link = 'maps://?q=' + adresse;
    }       
    return link;
}
function onTapPromo(e){
    var uid = $(e.touch.target).attr('data-promotion-uid');
    app.mobileApp.navigate('#components/promotions/details.html?uid=' + uid);
}
function onTapConcours(e){
    var uid = $(e.touch.target).attr('data-promotion-uid');
    app.mobileApp.navigate('#components/promotions/details.html?uid=' + uid);
}
function onTapDeal(e){
    var uid = $(e.touch.target).attr('data-promotion-uid');
    var url = $(e.touch.target).attr('data-deal-url');
    app.mobileApp.navigate('#components/promotions/details.html?uid=' + uid);
}
function _swipe(_direction,_span,_nextSpan){
    //hide current view
    if(_direction!="right") $('.span'+_span).hide();

    $('.span'+_span).removeClass("active");
    $('.span'+_nextSpan).addClass("active");
    $('.span'+_nextSpan).show();
    span = _nextSpan ;
    currentSpan = span ;

    var element = $('.span'+span);
    if(span>1){
        //
        $('#categorie-vide').hide()
        currentCategorie=element.attr("data-id");
        app.promotions.promotionsModel.dataSource.filter({
            "field": "categorie",
            "operator": "equals",
            "value": currentCategorie
        });  
        //check nb Promotion                          
        var nbPromotion = app.promotions.promotionsModel.dataSource.view();
        if(nbPromotion!=undefined && nbPromotion!=null){
            if(nbPromotion.length==0) $('#categorie-vide').show();
        }

        // STOCKER LES PROMOTIONS VUES
        var categories=app.categories.categoriesModel.dataSource.data();
        var mycat;
        for (var i = 0; i < categories.length; i++) {
            var cat = categories[i];
            if(cat.Id==currentCategorie){
                mycat=cat;
            }
        }
        if(typeof mycat !== 'undefined' && mycat.promotions_ids){
            var viewedPromotions = localStorage.getItem("viewedPromotions");
            if(!viewedPromotions){viewedPromotions=new Array();}else{viewedPromotions = JSON.parse(viewedPromotions);};
            for (var i = 0; i < mycat.promotions_ids.length; i++) {
                var id=mycat.promotions_ids[i];
                var index=viewedPromotions.indexOf(id);
                if(-1 == index){
                    viewedPromotions.push(id);
                }
            }
            localStorage.setItem("viewedPromotions", JSON.stringify(viewedPromotions));
                $('#categorie_'+currentCategorie+' .new').addClass('hidden');
        }
    }

    if(span==0){
        $('#categorie-vide').hide();
        app.promotions.promotionsModel.dataSource.filter(null);
        $('#promotionsList').show();
        $('#concoursList').hide();
    }else if(span==1){
        $('#categorie-vide').hide();
        $('#promotionsList').hide();
        $('#concoursList').show();
    }else if(span==2){
        $('#promotionsList').show();
        $('#concoursList').hide();
    }

}