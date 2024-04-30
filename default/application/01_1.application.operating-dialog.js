(function(){

var OperatingDialogClass = _Components.Dialog.extend(
{
    __abstract: [ '_doAction' ],
    
    _setup_: function()
    {
        this._options.headerVisible = true;
        this._options.width         = 450;
        this._options.height        = 550;
    },

    _setupElements_: function()
    {
        this.$dialogContent = this.find( '>.dialog-content' );
        this.$buttonsContainer = this.find( '>.buttons-container' );
        
        this.$doneButton = this.$buttonsContainer.find( '.done-button' );
        this.$cancelButton = this.$buttonsContainer.find( '.cancel-button' );
    },
    
    _setupActions_: function()
    {
        var self = this;
        
        this.$doneButton.on( 'click', function()
        {
            self._doAction();
        });
        
        this.$cancelButton.on( 'click', function()
        {
            self._doCancel();
        });
        
        this.bind( 'scrollToMe', function( event, $element )
        {
            self.$dialogContent.scrollTo( $element );
        });
        
    },
    
    _init_: function()
    {
        this._hideCloseButton();
    },
    
    _open_: function()
    {
        this.reset();
        
        OperatingDialogClass._stack.push( this );
    },
    
    _close_: function()
    {
        OperatingDialogClass._stack.remove( this );
    },
    
    _doCancel: function()
    {
        this.close();
    },
    
    showError: function( error )
    {
        System.alert( error );
    }
    
});

//------------------------------------------------------------------------------

OperatingDialogClass._stack = [];

OperatingDialogClass.closeAll = function()
{
    while( this._stack.length )
    {
        this._stack.last().close();
    }
};

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

_Application.OperatingDialog = OperatingDialogClass;

})();