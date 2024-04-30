(function(){
    
var AscensoarePageClass = _Components.Container.extend(
{
    _setupResources_: function()
    {
        this.AscensoareSection = new AscensoareSectionClass( this.find( '>.ascensoare-section' ) );
    }
    
});

//==============================================================================

var AscensoareSectionClass = _Configurare.ScariItemsSection.extend(
{
    _setup_: function()
    {
        this.ItemsData = DataResource.get( 'Configuration' ).getConfiguration( 'ascensoare' );
        this.dataObserverEvent = 'updateAscensoare';
        
        this.ListRendererClass = ListRendererClass;
        
        this.text = {
            emptyMessage:   'Nu există nicio scară cu ascensoare. Puteți înregistra facturi pentru ascensoare doar dacă există cel puțin un ascensor.',
            listMessage:    'Există {count} cu ascensoare.',
            countSingular:  'scară',
            countPlural:    'scări'
        };
    },
    
    getItemsCount: function()
    {
        return this.ItemsData.getAscensoareCount();
    }
    
});

//------------------------------------------------------------------------------

var ListRendererClass = _Configurare.ScariSelectionList.extend(
{
    getItemsData: function()
    {
        var AscensoareData = DataResource.get( 'Configuration' ).getConfiguration( 'ascensoare' ),
            itemsData = AscensoareData.getAscensoare();
        
        return itemsData;
    }
    
});

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

_Configurare.Ascensoare = AscensoarePageClass;

})();