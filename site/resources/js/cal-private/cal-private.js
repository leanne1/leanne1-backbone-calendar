var gumCal = gumCal || {};
	gumCal.Cals = gumCal.Cals || {};

//Private calendar initialise
$(function(){
	var initialiseCal, getUserSettings,
		calConfigs = document.querySelectorAll('[data-ad-config]'),
		cals = [], slots = {};
		;
	
	//+++++++++++++++++++++++++++++++++++++++++
	//+ Initialise gumcal app
	//+++++++++++++++++++++++++++++++++++++++++
	initialiseCal = function( el, adId ){
		var submitBtn = el.querySelector('[data-cal-submit]'),
			myCalTab = document.querySelector('[data-cal-tab="'+ adId +'"]')
		;

		//Instantiate jQuery date-pickers on date inputs
		$('#date-from-' + adId).datepicker({
	        dateFormat: 'yy-mm-dd'
	    });    
		$('#date-to-' + adId).datepicker({
	        dateFormat: 'yy-mm-dd'
	    }); 

		yokeInputs(adId);

		//Check if app has already been initialised; if not then initialise 
		submitBtn.addEventListener('click', function( e ){
			e.preventDefault();
			initCal(e, adId, el);
		});
	
	};	
	
	//+++++++++++++++++++++++++++++++++++++++++
	//+ Yoke inputs
	//+++++++++++++++++++++++++++++++++++++++++
	
	yokeInputs = function(adId){
		var masterInput = document.querySelectorAll('[data-master-input]')
			;		

		for (var i = 0; i < masterInput.length; i++) {
			(function(index){
				masterInput[index].addEventListener('change', function(){
					var inputName = this.getAttribute('data-master-input'),
						puppetInput = document.querySelector('[data-puppet-input="' + inputName + '"]'),
						isChecked = this.checked;
					if(isChecked) {
						puppetInput.removeAttribute('disabled');
					} else {
						puppetInput.setAttribute('disabled', true);
					}
				});	
			})(i);
		}	
	};

	//+++++++++++++++++++++++++++++++++++++++++
	//+ Init cal
	//+++++++++++++++++++++++++++++++++++++++++
	
	initCal = function( e, adId, el ) {
		cals[adId] && cals[adId].close();
		cals[adId] = null;		
		getUserSettings(e, adId, el);	
	};

	//+++++++++++++++++++++++++++++++++++++++++
	//+ Get user settings
	//+++++++++++++++++++++++++++++++++++++++++
	
	//Get user settings from form submit
	getUserSettings = function( e, adId, el ){
		e.preventDefault();
		var userSettings = {};

		userSettings.context = 'private';
		userSettings.adId = adId;
		userSettings.slotDuration = parseInt(el.querySelector('[id^="slot-duration"]').value);
		userSettings.startDate = el.querySelector('[id^="date-from"]').value;
		userSettings.endDate = el.querySelector('[id^="date-to"]').value;
		userSettings.location = el.querySelector('[id^="location"]').value;
		userSettings.locationPrivate = el.querySelector('[id^="location-private"]').checked ? true : false;
		userSettings.msgRequired = el.querySelector('[id^="public-msg-required"]').checked ? true : false;
		userSettings.msgSubject = el.querySelector('[id^="msg-subject"]').value;
		userSettings.autoConfirm = el.querySelector('[id^="auto-confirm"]').checked ? true : false;

		initSlots( userSettings );
	};

	//+++++++++++++++++++++++++++++++++++++++++
	//+ Create collection
	//+++++++++++++++++++++++++++++++++++++++++

	//App entry point - init new Backbone slots collection for this cal instance
	initSlots = function( settings ){
		var adId = settings.adId;
			
		slots[adId] = new gumCal.Slots(adId);
		
		///TODO: If using RESTful API, change this to be actual url
		slots[adId].url = '/api/v1/123456789/cal/slots';
		slots[adId].fetch({ reset: true });

		cals[adId] = initCalView(settings, slots[adId]);
	};

	//+++++++++++++++++++++++++++++++++++++++++
	//+ Build cal view
	//+++++++++++++++++++++++++++++++++++++++++

	//Init new Backbone cal view [master view]
	initCalView = function( settings, collection ){
		var $cal = $('#cal-' + settings.adId),
			options = { settings: settings, collection: collection },
			calView = new gumCal.CalView( options );
			$cal.append(calView.render().el);
			
		return calView;
	};

	//Listen for each calconfig on the page
	_.each(calConfigs, function( el, index ) {
		var adId = el.getAttribute('data-ad-id');
		gumCal.Cals[adId] = {};
		initialiseCal( el, adId );
	});
});