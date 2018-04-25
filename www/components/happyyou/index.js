'use strict';

app.happyyou = kendo.observable({
	 beforeShow: function(){
		 var happyYou=localStorage.getItem("happyYou");
		 if(happyYou && ''!=happyYou){
			 	$('.primary-group.email-group.forms-builder-group #email').val(happyYou);

				 $('.primary-group.email-group.forms-builder-group #mikoDay').val(localStorage.getItem("happyYou_mikoDay"));
				 $('.primary-group.email-group.forms-builder-group #mikoMonth').val(localStorage.getItem("happyYou_mikoMonth"));
				 $('.primary-group.email-group.forms-builder-group #mikoYear').val(localStorage.getItem("happyYou_mikoYear"));
				 $('#DATE_DE_NAISSANCE').val($('#mikoDay').val()+'-'+$('#mikoMonth').val()+'-'+$('#mikoYear').val());
				 $('.primary-group.email-group.forms-builder-group #NOM').val(localStorage.getItem("happyYou_NOM"));
				 $('.primary-group.email-group.forms-builder-group #PRENOM').val(localStorage.getItem("happyYou_PRENOM"));
				 $('.primary-group.email-group.forms-builder-group #SMS').val(localStorage.getItem("happyYou_SMS"));
				 $('.primary-group.email-group.forms-builder-group #CODE_POSTAL').val(localStorage.getItem("happyYou_CODE_POSTAL"));

				if(1==localStorage.getItem("happyYou_SEXE")){
					$('#SEXE1').prop('checked',true);
					$('#SEXE2').prop('checked',false);
				}else{
					$('#SEXE1').prop('checked',false);
					$('#SEXE2').prop('checked',true);
				}


			 	$('.primary-group.email-group.forms-builder-group .row,#sendInBLueSubmit').show();
		 		$('#sendInBLueSubmit').html('Mettre à jour');
		 }
		 
							
      	$('#happyYouView .km-content').data("kendoMobileScroller").reset(); 
	 },
    onShow: function() {
	},
    afterShow: function() {},
	openApp: function(){
		app.mobileApp.navigate('#components/promotions/view.html');
	}
});

(function(parent) {
    var happyyouModel = kendo.observable({
        // openLink: function(url) {
        //     window.open(url, '_system');
        //     if (window.event) {
        //         window.event.preventDefault && window.event.preventDefault();
        //         window.event.returnValue = false;
        //     }
        // }
    });

    parent.set('happyyouModel', happyyouModel);
})(app.happyyou);