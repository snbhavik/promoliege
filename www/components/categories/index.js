'use strict';

app.categories = kendo.observable({
    beforeShow: function(){

		app.categories.categoriesModel.dataSource.read().then(function(){
			//console.log('app.categories');
            //app.categories.sortByNumber();
		});
		

      // SCROLL TOP IF NECESSARY
        if(app.categories.categoriesModel.scrollTop){
			$('#categorieView .km-content').data("kendoMobileScroller").reset();  
        }else{
            app.categories.categoriesModel.scrollTop=true;
        } 
       
    },
    onShow: function() {
        // CACHER LE BOUTON DE RETOUR
        $('#retour img,#launchCategories').addClass('hidden');
        
    },
    afterShow: function() {
        refreshCategories();
    }
});

(function(parent) {
    var dataProvider = app.data.promosLiegeBackend,
        
		sortByNumber = function(){
			//console.log('sort by number');
			app.categories.categoriesModel.dataSource.sort([{ field: "empty", dir: "asc" },{ field: "visibility", dir: "desc" }]);
		},
        dataSourceOptions = {
            type: 'everlive',
            transport: {
                typeName: 'categories',
                dataProvider: dataProvider
            },

            change: function(e) {
                var data = this.data();
               	var serverCategories=new Array();
                var promotions =  localStorage.getItem("promotions");
                for (var i = 0; i < data.length; i++) {
                    var dataItem = data[i];
                    // SHOW OR HIDE CATEGORIE
                    var reglages = localStorage.getItem("reglages");
                    if(!reglages){reglages=new Array();}else{reglages = JSON.parse(reglages);};
                    var id=dataItem.Id;
                    serverCategories.push(id);
                    var index=reglages.indexOf(id);
                    if(-1 == index){
                         dataItem["visibility"] = ' hidden';
                    }else{
                        dataItem["visibility"] = ' zzz';
                    }
                    // SHOW NUMBER OF NEW CATS
                    var numberOfPromotions;
                    //if(!dataItem.promotions_ids){numberOfPromotions=0;}else{numberOfPromotions=dataItem.promotions_ids.length;};
					
                    numberOfPromotions = 0 ;
                    if(promotions){
                        var jsonProm = JSON.parse(promotions);
                        $.each(jsonProm.categories,function(key,val){
                            if(key == dataItem.Id){
                                numberOfPromotions = val['count'];
                            }
                        });
                    }


                    dataItem["totalNew"] = numberOfPromotions;
                    if(numberOfPromotions>0){
                        
                        /*var viewedPromotions = localStorage.getItem("viewedPromotions");
                		if(!viewedPromotions){viewedPromotions=new Array();}else{viewedPromotions = JSON.parse(viewedPromotions);};
                        for (var j = 0; j < dataItem.promotions_ids.length; j++) {
                            var found=false;
                            for (var k = 0; k < viewedPromotions.length; k++) {
                                if(dataItem.promotions_ids[j]==viewedPromotions[k]){
                                	found=true;
                            	}
                            }
                            if(found){numberOfPromotions--;};
                        }*/
                        
                        dataItem["new"] = numberOfPromotions;
                        // CATEGORY WITH CONTENT
                        dataItem["empty"]='';
					}else{
                        dataItem["new"] = '0';
                        // EMPTY CATEGORIE
                        dataItem["empty"]=' empty';
                    }
                    if(0==dataItem["new"]){
                        dataItem["newStatus"]=' hidden';
                    }else{
                        dataItem["newStatus"]='';
                    }
                }
                cleanSettings(serverCategories);
                
                // LOADER
                $('#categorieView .mikoLoader').hide();
            },
            schema: {
                model: {
                    fields: {
                        'nom': {
                            field: 'nom',
                            defaultValue: ''
                        }
                    }
                }
            },
           	serverSorting: false,
 			sort: { field: "nom", dir: "asc" }
        },
        dataSource = new kendo.data.DataSource(dataSourceOptions),
        categoriesModel = kendo.observable({
            dataSource: dataSource,
            itemClick: function(e) {
                if(" empty"==e.dataItem.empty){
                  //  alert('');
                    
                    $("#emptyCategorieMessage").data("kendoMobileModalView").open();
                    
				}else{
                    // TELL PROMOTIONS VIEW NOT TO SCROLL TOP WHEN COMING BACK
                	categoriesModel.set('scrollTop', false);
                    
                    
                    app.mobileApp.navigate('#components/promotions/view.html?cat_id=' + e.dataItem.id);
                }
                
            },
            initiate: function(e) {
                //refreshCategories();
            },
            scrollTop : true
        });

    parent.set('categoriesModel', categoriesModel);
	parent.set('sortByNumber', sortByNumber);
})(app.categories);

function  refreshCategories() {
    	var reglages = localStorage.getItem("reglages");
    	if(!reglages){reglages=new Array();}else{reglages = JSON.parse(reglages);};
    	
    	if(0==reglages.length){
    		app.reglages.set("giveHint", true); 
            $('#messageCategories').show();
            $('#categorieView').addClass('styled');
         }else{
             app.reglages.set("giveHint", false); 
            $('#messageCategories').hide();
             $('#categorieView').removeClass('styled');
         }
 }

function resetRedBoutons(){
    localStorage.removeItem("viewedPromotions");
    //app.categories.categoriesModel.dataSource...;
}

function closeModal() {
   $("#emptyCategorieMessage").data("kendoMobileModalView").close();
}
function goToOptions() {
   app.mobileApp.navigate('#components/reglages/view.html');
}
function cleanSettings(serverCategories){
    var reglages = localStorage.getItem("reglages");
    if(!reglages){reglages=new Array();}else{reglages = JSON.parse(reglages);};
    var cleanedReglages=new Array();
    for (var i = 0; i < reglages.length; i++) {
         var categorieToTest = reglages[i];
         var index=serverCategories.indexOf(categorieToTest);
         if(-1 == index){
             // was deleted in server, remove from reglages
         }else{
             cleanedReglages.push(categorieToTest);
         }
    }
    localStorage.setItem("reglages", JSON.stringify(cleanedReglages));
}