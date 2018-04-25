var everlive;

//poly
if ( !String.prototype.includes ) {
  String.prototype.includes = function(search, start) {
    'use strict';
    if (typeof start !== 'number') {
      start = 0;
    } 

    if (start + search.length > this.length) {
      return false;
    } else {
      return this.indexOf(search,start) !== -1;
    }
  };
}

var isProductionApp=false;
if(isProductionApp){
    var telerikKey='Kxzmc9ZDTejDCwXH';
}else{
    var telerikKey='ujby5PXWhtFGfuuF';
}


// store a reference to the application object that will be created
    // later on so that we can use it if need be
var app = {
    data: {} ,
    mobileApp : {}
};

(function() {
    
	
    var bootstrap = function() {
        $(function() {
			var initialView;
			var happyYou=localStorage.getItem("happyYou");
			//   alert(happyYou);
	  		if(happyYou && ''!=happyYou){
				initialView="promotions";
			}else{
				initialView="happyyou";
			}
            app.mobileApp = new kendo.mobile.Application(document.body, {
                // you can change the default transition (slide, zoom or fade)
                transition: 'none',
                // comment out the following line to get a UI which matches the look
                // and feel of the operating system
                skin: 'flat',
                // the application needs to know which view to load first
                initial: 'components/'+initialView+'/view.html',
                statusBarStyle: 'black-translucent' ,
                init : function(){

                    app.mobileApp.router.bind('change',function(e){
                        var nextURL = e.url;
                        if(nextURL.includes('components/promotions/view.html')){
                            $('#menu-haut-promotions').show();
                        }else{
                            $('#menu-haut-promotions').hide();
                        }
                    });
                }
            });


            $(document).on('click','#mesAchats',function(){
                if(isProductionApp==false){
                    window.open('https://promoliege.mikodigital.com/compte/', '_system');
                }else{
                    window.open('https://www.promoliege.com/compte/', '_system');
                }
            });

            $(document).on('click','#conditionsG',function(e){
                e.preventDefault();
                window.open('https://www.promoliege.com/conditions-generales', '_system');                
            });

            

            /*

            $("#drawer").kendoMobileDrawer({
                container: "#content-container"
            });

            $("#drawer-trigger").click(function() {
                $("#drawer").data("kendoMobileDrawer").show();
                return false;
            });

            */

        });
    };

    if (window.cordova) {
        // this function is called by Cordova when the application is loaded by the device
        document.addEventListener('deviceready', function() {
            
           /* app.data.promosLiegeBackend.helpers.html.on('processed', function(result) {
                console.log(JSON.stringify(result));
                
                $('.details #imageContainer').show();
            });*/
            
            // LAUNCH CONTENT PERIODICAL REFRESH
            //keepDataSynced();
            
            // IF LAUNCHED OFFLINE, TELL DATAPROVIDER
            var isOffline = !app.isOnline();
			app.data.promosLiegeBackend.offline(isOffline);
            
            // ACTIVATE FEEDBACK
           // feedback.initialize('b7cffbb0-70c4-11e5-a637-3f7ca39c615e');
            
            
           //app.concours.concoursModel.dataSource.read();

            // REFRESH CONTENT WHEN COMING BACK TO APP
           	document.addEventListener('resume', function() {
                app.categories.categoriesModel.dataSource.read().then(function(){
                    app.promotions.promotionsModel.dataSource.read().then(function(){
						app.promotions.sortByFavorite();
                	});
                });
				
            });
            
            // ACTIVATE PUSH NOTIFICATIONS
            everlive = new Everlive({
                apiKey: telerikKey,
                scheme: 'http'
            });
            if (window.navigator.simulator === true){
            //running in the simulator
            }
            else{
            //running on a device
                 activatePush();
            }
           
            
            // hide the splash screen as soon as the app is ready. otherwise
            // Cordova will wait 5 very long seconds to do it for you.
            if (navigator && navigator.splashscreen) {
                navigator.splashscreen.hide();
            }

            var element = document.getElementById('appDrawer');
            if (typeof(element) != 'undefined' && element != null) {
                if (window.navigator.msPointerEnabled) {
                    $("#navigation-container").on("MSPointerDown", "a", function(event) {
                        app.keepActiveState($(this));
                    });
                } else {
                    $("#navigation-container").on("touchstart", "a", function(event) {
                        app.keepActiveState($(this));
                    });
                }
            }
            bootstrap();
        }, false);
    } else {
        bootstrap();
    }

    app.keepActiveState = function _keepActiveState(item) {
        var currentItem = item;
        $("#navigation-container li a.active").removeClass("active");
        currentItem.addClass('active');
    };

    window.app = app;

    app.isOnline = function() {
        if (!navigator || !navigator.connection) {
            return true;
        } else {
            return navigator.connection.type !== 'none';
        }
    };
}());

// START_CUSTOM_CODE_kendoUiMobileApp


function activatePush(){
   //  alert('doing');
     var pushSettings = {
        iOS: {
            badge: true,
            sound: true,
            alert: true,
            clearBadge: true
        },
        android: {
            projectNumber: '328506265708'
        },
        wp8: {
            channelName: 'EverlivePushChannel'
        },
        notificationCallbackIOS: function(e) {
            // logic for handling push in iOS
            //alert(JSON.stringify(e));
           
            if("1"==e.foreground){
                //alert('nouvelle promotion');
            }else{
				if('concours'==e.id){
                        app.mobileApp.navigate('#components/concours/view.html');
                }else{
					if('0'!=e.id){
						//registerPromotionAsViewedWhenNotifcationClicked(e.id);
						if(''==e.dealUrl){
							app.mobileApp.navigate('#components/promotions/details.html?wpReference=' + e.wpReference);
						}else{
							app.mobileApp.navigate('#components/promotions/view.html');
							window.open(e.dealUrl, '_system');
						}
					}else{
						app.mobileApp.navigate('#components/promotions/view.html?cat_id=' + e.categorie);
					}
				}
            }
        },
        notificationCallbackAndroid: function(e) {
            // logic for handling push in Android
           //alert(JSON.stringify(e));
            if(e.foreground){
                //alert('nouvelle promotion');
            }else{
				if('concours'==e.payload.id){
					app.mobileApp.navigate('#components/concours/view.html');
				}else{
					if('0'!=e.payload.id){
						// registerPromotionAsViewedWhenNotifcationClicked(e.payload.id);
						if(''==e.payload.dealUrl){
							app.mobileApp.navigate('#components/promotions/details.html?wpReference=' + e.payload.wpReference);
						}else{
							app.mobileApp.navigate('#components/promotions/view.html');
							window.open(e.payload.dealUrl, '_system');
						}
						
					}else{
						app.mobileApp.navigate('#components/promotions/view.html?cat_id=' + e.payload.categorie);
					}
				}
            }
           
        },
        notificationCallbackWP8: function(e) {
            // logic for handling push in Windows Phone
            //alert(JSON.stringify(e));
        }
    };
	
    
	everlive.push.register(
        pushSettings, 
        function successCallback(data) {
            // This function will be called once the device is successfully registered
           //alert('success');
           updateNotificationsSettings();
        },
        function errorCallback(error) {
            // This callback will be called any errors occurred during the device
            // registration process
            // alert(JSON.stringify(error));
        }
    );
   //alert('done');
}

function updateNotificationsSettings(){
     if (window.navigator.simulator === true){
    	/* running in the simulator */
    }
    else{
    	//running on a device
        var frequency = localStorage.getItem("frequency");
        if(frequency == null){
            var originalFrequency="daily";
			frequency=originalFrequency;
            localStorage.setItem("frequency",originalFrequency);
        }
        var reglages = localStorage.getItem("reglages");
		if(!reglages){reglages=new Array();}else{reglages = JSON.parse(reglages);};
		var jsonString='{"categories": '+JSON.stringify(reglages)+',"frequency": "'+frequency+'"}';
		everlive.push.updateRegistration(JSON.parse(jsonString),
            function(){
            	// if(app.reglages.giveHint && 1== reglages.length){
                     
                //     setTimeout(function() { $("#giveHint").data("kendoMobileModalView").open(); }, 5000);
                //     app.reglages.set("giveHint", false); 
                // }
        	},
            function(){
            	// erreur
            	
        	}                        
		);
    }
}

function registerPromotionAsViewedWhenNotifcationClicked(id){
    var viewedPromotions = localStorage.getItem("viewedPromotions");
    if(!viewedPromotions){viewedPromotions=new Array();}else{viewedPromotions = JSON.parse(viewedPromotions);};
	var index=viewedPromotions.indexOf(id);
    if(-1 == index){
       viewedPromotions.push(id);
    }
    localStorage.setItem("viewedPromotions", JSON.stringify(viewedPromotions));
}

function keepDataSynced(){
    (function poll(){
       setTimeout(function(){
         // $('#categorieView .loader').show();
          app.categories.categoriesModel.dataSource.read().then(
            function(){
                 app.promotions.promotionsModel.dataSource.read();
                //$('#categorieView .loader').hide(500);
                poll();
            }
          );
      }, 60000);
    })();
}

// CATEGORIES MODAL
app.openCategoriesModal=function () {
//    $("#categoriesModal").data("kendoMobileModalView").open();
	app.mobileApp.navigate('#components/categories/view.html');
};

app.closeCategoriesModal=function () {
//    $("#categoriesModal").data("kendoMobileModalView").close();
};


// END_CUSTOM_CODE_kendoUiMobileApp