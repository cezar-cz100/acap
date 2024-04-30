(function(){
    
var GazeNaturalePageClass = _Components.Container.extend(
{
    _setupResources_: function()
    {
        this.BransamenteSection = new BransamenteSectionClass( this.find( '>.bransamente-section' ) );
    }
    
});

//==============================================================================

var BransamenteSectionClass = _Configurare.ScariItemsSection.extend(
{
    _setup_: function()
    {
        this.ItemsData = DataResource.get( 'Configuration' ).getConfiguration( 'gaze_naturale' );
        this.dataObserverEvent = 'updateBransamente';
        
        this.ListRendererClass = ListRendererClass;
        
        this.text = {
            emptyMessage:   'Nu există nicio scară branşată la reţeaua de gaze naturale. Puteți înregistra facturi pentru gaze naturale doar dacă există cel puțin un branşament.',
            listMessage:    'Există {count} la reţeaua de gaze naturale.',
            countSingular:  'scară',
            countPlural:    'scări'
        };
    },
    
    getItemsCount: function()
    {
        return this.ItemsData.getBransamenteCount();
    }

});

//------------------------------------------------------------------------------

var ListRendererClass = _Configurare.ScariSelectionList.extend(
{
    getItemsData: function()
    {
        var GazeNaturaleData = DataResource.get( 'Configuration' ).getConfiguration( 'gaze_naturale' ),
            itemsData = GazeNaturaleData.getBransamente();
        
        return itemsData;
    }
    
});

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

_Configurare.GazeNaturale = GazeNaturalePageClass;

})();