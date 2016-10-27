ni.RegisterNameSpace("framework");

//*********************Listener********************************/
framework.listener = function() { };
framework.listener = new framework.listener();

framework.EventListener = function() {
	this.listenername;
	this.listener;
	this.listenerKey;
	this.defaultArguments;
}

ni.apply(framework.listener, {
	LISTENER_GOTO_NEXT: 'LISTENER_GOTO_NEXT',
	LISTENER_GOTO_PREVIOUS: 'LISTENER_GOTO_PREVIOUS',

	LISTENER_GOTO_DATASOURCE: 'LISTENER_GOTO_DATASOURCE',
	LISTENER_GOTO_GEOTYPE: 'LISTENER_GOTO_GEOTYPE',
	LISTENER_GOTO_GEO: 'LISTENER_GOTO_GEO',
	LISTENER_GOTO_DEMOOPTION: 'LISTENER_GOTO_DEMOOPTION',
	LISTENER_GOTO_DEMO: 'LISTENER_GOTO_DEMO',
	LISTENER_GOTO_POLLCOUNT: 'LISTENER_GOTO_POLLCOUNT',
	LISTENER_GOTO_RESULTS: 'LISTENER_GOTO_RESULTS',
	LISTENER_GOTO_PAYMENT: 'LISTENER_GOTO_PAYMENT',
	LISTENER_GOTO_SUCCESS: 'LISTENER_GOTO_SUCCESS',

	LISTENER_INIT_STEP: 'LISTENER_INIT_STEP',
	LISTENER_SET_BUTTONS: 'LISTENER_SET_BUTTONS',
	LISTENER_UPDATE_RESULTS_ORDER: 'LISTENER_UPDATE_RESULTS_ORDER',

	_listeners: [],
	AddListener: function(listenername, fn, fnKey, defaultArgs) {
		fnKey = ((fnKey == null || fnKey == window.undefined) ? null : fnKey);
		var lst = new framework.EventListener();
		lst.listenername = listenername;
		lst.listener = fn;
		lst.listenerKey = fnKey;
		lst.defaultArguments = defaultArgs;

		for (var i = 0; i < this._listeners.length; i++) {
			if (this._listeners[i].listenername == listenername
                && ((fnKey == null && this._listeners[i].listener == fn) || (fnKey != null && this._listeners[i].listenerKey == fnKey))
                ) {
				// listener already exists, no need to add it
				return;
			}
		}
		// if listener does not exist, add it to listeners array
		this._listeners.push(lst);
		// this._listeners[this._listeners.length] = lst;
	},

	FireListener: function(listenername, args) {
		for (var i = 0; i < this._listeners.length; i++) {
			if (this._listeners[i].listenername == listenername) {
				// find the listener, then we need call the registered function
				if (args == null || args == window.undefined) {
					this._listeners[i].listener(this._listeners[i].defaultArguments);
				} else {
					this._listeners[i].listener(args);
				}
			}
		}
	}

});
