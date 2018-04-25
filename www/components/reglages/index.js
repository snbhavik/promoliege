'use strict';

app.reglages = kendo.observable({
    giveHint: false,
    beforeShow: function(){
      $('#reglagesView .km-content').data("kendoMobileScroller").reset();  

	  var happyYou=localStorage.getItem("happyYou");
	//   alert(happyYou);
	  if(happyYou && ''!=happyYou){
		  app.reglages.set('happyYouText','Activé ('+happyYou+')');
	  }else{
		  app.reglages.set('happyYouText','Désactivé');
	  }
	  
// localStorage.setItem("happyYou",'actif');
    },
    onShow: function(e) {
        // GET NOTIFICATION STATE IN STRING FORMAT
        var notificationStringState;
        switch(localStorage.getItem("frequency")) {
            case 'directly':
                notificationStringState='Instantanément';
                break;
            case 'daily':
                notificationStringState='Une fois par jour';
                break;
            case 'weekly':
                notificationStringState='Une fois par semaine';
                break;
            case 'never':
                notificationStringState='Jamais';
                break;
            default:
                notificationStringState='inconnu';
        };
        app.reglages.set('notifications',notificationStringState);
        
        // CACHER LE BOUTON DE RETOUR
      	$('#retour img,#launchCategories').addClass('hidden');
    },
    afterShow: function() {
        
    },
    notifications : '',
	happyYouText: 'Inscrivez-vous',
    submitNotificationChange : function(e){
            var notifState;
            switch(e.target.value) {
                case 'Instantanément':
                    notifState='directly';
                    break;
                case 'Une fois par jour':
                    notifState='daily';
                    break;
                case 'Une fois par semaine':
                    notifState='weekly';
                    break;
                case 'Jamais':
                    notifState='never';
                    break;
                default:
                    notifState='';
            }
            localStorage.setItem("frequency",notifState);
            updateNotificationsSettings();
            $("#notificationsPanel").data("kendoMobileModalView").close();
    },
    showNotificationPanel : function(){
    	if(app.isOnline()){
        	$("#notificationsPanel").data("kendoMobileModalView").open();
        }else{
           $("#reglagesOfflineMessage").data("kendoMobileModalView").open();
        }
    },
    closeNotificationPanel : function(){
    	$("#notificationsPanel").data("kendoMobileModalView").close();
	},
    seePromos : function(){
    	$("#giveHint").data("kendoMobileModalView").close();
        app.mobileApp.navigate('#components/categories/view.html');
	},
    continueSettings : function(){
    	$("#giveHint").data("kendoMobileModalView").close();
	},
	showHappyYou : function(){
		app.mobileApp.navigate('#components/happyyou/view.html');
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
            type: 'everlive',
            transport: {
                typeName: 'categories',
                dataProvider: dataProvider
            },

            change: function(e) {
                var data = this.data();
                for (var i = 0; i < data.length; i++) {
                    var dataItem = data[i];
                }
                // LOADER
                $('#reglagesView .mikoLoader').hide();
            },
            schema: {
                model: {
                    fields: {
                        'nom': {
                            field: 'nom',
                            defaultValue: ''
                        },
                    }
                }
            },
            serverSorting: true,
 			sort: { field: "nom", dir: "asc" }
        },
        dataSource = new kendo.data.DataSource(dataSourceOptions),
        reglagesModel = kendo.observable({
            
            dataSource: dataSource,
            itemClick: function(e) {
                //console.log('setting clicked');
                if(app.isOnline()){
                    var reglages = localStorage.getItem("reglages");
                    if(!reglages){reglages=new Array();}else{reglages = JSON.parse(reglages);};
                    var id=e.dataItem.Id;
                    var index=reglages.indexOf(id);
                    if(-1 == index){
                       reglages.push(id);
                       $('#reglage_'+id+' img.non').removeClass('show');
                       $('#reglage_'+id+' img.oui').addClass('show');
                       $('#categorie_'+id).removeClass('hidden');
                    }else{
                       reglages.splice(index, 1);
                       $('#reglage_'+id+' img.oui').removeClass('show');
                       $('#reglage_'+id+' img.non').addClass('show');
                       $('#categorie_'+id).addClass('hidden');
                    }
                    localStorage.setItem("reglages", JSON.stringify(reglages));
                    updateNotificationsSettings();
                }else{
                    $("#reglagesOfflineMessage").data("kendoMobileModalView").open();
                }
            },
            initiate: function(e) {

                if(!localStorage.getItem('reglages_init')){
                    dataSource.fetch(function(){
                        var data = dataSource.data();
                        var json_tab = [] ;
                        for(var i = 0 ; i < data.length ; i++  ){
                            json_tab.push(data[i].id);
                        }   
                        localStorage.setItem("reglages", JSON.stringify(json_tab));
                        localStorage.setItem("reglages_init","true");
                        updateNotificationsSettings();
                    });                   
                }

                $("#reglagesListe").bind('DOMNodeInserted', function(e) {
                    var liToTreat = $(e.target)[0];
                    var reglages = localStorage.getItem("reglages");
                    var id=liToTreat.children[0].id.substr(8);                    
                    if(!reglages || !localStorage.getItem('reglages_init')){
                        reglages = [];
                        reglages.push(id);                        
                    }else{
                        reglages = JSON.parse(reglages);
                    };
                    var index=reglages.indexOf(id);
                    if(-1 == index){
                       $('#reglage_'+id+' img.oui').removeClass('show');
                       $('#reglage_'+id+' img.non').addClass('show');
                    }else{
                       $('#reglage_'+id+' img.non').removeClass('show');
                       $('#reglage_'+id+' img.oui').addClass('show');
                    }
                });
            },
            closeModal: function() {
               $("#reglagesOfflineMessage").data("kendoMobileModalView").close();
            }
        });

    parent.set('reglagesModel', reglagesModel);
})(app.reglages);

