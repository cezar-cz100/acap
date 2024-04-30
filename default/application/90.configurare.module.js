(function(){
    
var ModuleClass = _Components.Container.extend(
{
    _setupResources_: function()
    {
        this.Panes = new PanesConstructor( this.find( '>.panes-container' ), {
            $tabsContainer: this.find( '>.tabs-container' ),
            paneConstructors: {
                gaze_naturale:      _Configurare.GazeNaturale,
                ascensoare:         _Configurare.Ascensoare,
                energie_electrica:  _Configurare.EnergieElectrica
            }
        });
    },
    
    _parameters_: function( params )
    {
        if( params.page !== undefined )
        {
            this.openPage( params.page );
        }
    },
    
    openPage: function( page )
    {
        this.Panes.showPane( page );
    }
    
});

//==============================================================================

var PanesConstructor = _Components.Panes.extend(
{
    
});

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

_Configurare.Module = ModuleClass;

})();