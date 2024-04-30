(function(){
    
_Cheltuieli.CheltuieliNeachitate = _Components.Container.extend(
{
    _setup_: function()
    {
        if( !this._options.Module )
        {
            throw new Error( '"Module" option is not set.' );
        }
        
        this.Module = this._options.Module;
    },
    
    _setupResources_: function()
    {
        var pageOptions;
                
        pageOptions = {
            Module: this 
        };
        
        this.Panes = new PanesClass( this.find( '>.panes-container' ), {
            defaultPane:    'list',
            paneConstructors: {
                list:   [ _Cheltuieli.ListCheltuieliNeachitate, pageOptions ]
            }
        });
    },
    
    _setupActions_: function()
    {
        
    },
    
    _init_: function()
    {
        
    }
    
});

var PanesClass = _Components.Panes.extend(
{
    
});

})();