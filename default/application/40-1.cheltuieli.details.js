(function(){

var __DetailsClass = _Components.Container.extend(
{
    __interface: [ 'setCheltuialaData' ],
    
    __abstract: [ 'populateContent' ],
    
    _setup_: function()
    {
        this.cheltuialaData = null;
        this.parametruSpatii = null;
    },

    _setupElements_: function()
    {
        this.$detailsSection        = this.find( '.section.details-section' );
        this.$contributiiSection    = this.find( '.section.contributii-section' );
        
        this.$valueElements = this.$detailsSection.find( '.value-element' );
                
        this.$descriere     = this.$valueElements.filter( '.descriere' );
        this.$furnizor      = this.$valueElements.filter( '.furnizor' );
        this.$document      = this.$valueElements.filter( '.document' );
        this.$data          = this.$valueElements.filter( '.data' );
        this.$valoare       = this.$valueElements.filter( '.valoare' );
    },
    
    _setupResources_: function()
    {
        this.ContributiiSection = new ContributiiSectionClass( this.$contributiiSection );
    },
    
    _parameters_: function( params )
    {
        if( params.cheltuialaData !== undefined )
        {
            this.setCheltuialaData( params.cheltuialaData );
        }
    },
    
    setCheltuialaData: function( data )
    {
        this.cheltuialaData = data;
        
        this.populateContent( data );
    },
    
    populateContent: function( cheltuialaData )
    {
        var parametriCheltuiala = cheltuialaData.parametri;
        
        this.$descriere.text( parametriCheltuiala.descriere );
        this.$furnizor.text( parametriCheltuiala.furnizor );
        this.$document.text( parametriCheltuiala.act );
        this.$valoare.text( Number.formatCurrency( parametriCheltuiala.valoare ) + ' lei' );
        this.$data.text( Date.format( Date.DATE_WEEKDAY, parametriCheltuiala.data ) );
        
        if( !Object.isEmpty( cheltuialaData.contributii ) )
        {
            this.ContributiiSection.populate( cheltuialaData.contributii, this.parametruSpatii );
            this.ContributiiSection.show();
        }
        else
        {
            this.ContributiiSection.hide();
        }
        
        this._runHierarchy( '_populateContent_', [ cheltuialaData ] );
    }

});

//==============================================================================

var CheltuieliGospodarestiDetailsClass = __DetailsClass.extend(
{
    _setup_: function()
    {
        this.parametruSpatii = 'suprafata';
        
        this.FonduriData = DataResource.get( 'Fonduri' );
    },
    
    _setupElements_: function()
    {
        this.$fond          = this.$valueElements.filter( '.fond' );
        this.$coloana       = this.$valueElements.filter( '.coloana' );
        this.$spatii        = this.$valueElements.filter( '.spatii' );
        
        this.$repartizareRow    = this.$detailsSection.find( '.repartizare-row' );
        this.$coloanaRow        = this.$detailsSection.find( '.coloana-row' );
    },
    
    _populateContent_: function( cheltuialaData )
    {
        var parametriCheltuiala = cheltuialaData.parametri,
            fondId = parametriCheltuiala.fond,
            denumireFond = this.FonduriData.getDenumireFond( fondId );
        
        this.$fond.text( denumireFond );
        
        if( cheltuialaData.contributii )
        {
            var coloana = this.FonduriData.isRepartizareMandatory( fondId ) ?
                    'Cheltuieli gospodăreşti' :
                    denumireFond;
                    
            this.$coloanaRow.show();
            this.$coloana.text( coloana );
            
            this.$repartizareRow.show();
            this.$spatii.text( String.pluralize( Object.size( cheltuialaData.contributii ), 'apartament', 'apartamente' ) );
        }
        else
        {
            this.$coloanaRow.hide();
            this.$repartizareRow.hide();
        }
    }
        
});

//==============================================================================

var SalariiDetailsClass = __DetailsClass.extend(
{
    _setup_: function()
    {
        this.parametruSpatii = 'suprafata';
        
        this.FonduriData = DataResource.get( 'Fonduri' );
    },
    
    _setupElements_: function()
    {
        this.$beneficiar    = this.$valueElements.filter( '.beneficiar' );
        this.$fond          = this.$valueElements.filter( '.fond' );
        this.$coloana       = this.$valueElements.filter( '.coloana' );
        this.$spatii        = this.$valueElements.filter( '.spatii' );
        
        this.$repartizareRow    = this.$detailsSection.find( '.repartizare-row' );
        this.$coloanaRow        = this.$detailsSection.find( '.coloana-row' );
        
        var $valoareRow = this.$detailsSection.find( '.valoare-row' );
        
        this.$valoare       = $valoareRow.find( '.valoare' );
        this.$taxe          = $valoareRow.find( '.taxe' );
    },
    
    _populateContent_: function( cheltuialaData )
    {
        var parametriCheltuiala = cheltuialaData.parametri,
            fondId = parametriCheltuiala.fond,
            denumireFond = this.FonduriData.getDenumireFond( fondId );
        
        this.$beneficiar.text( parametriCheltuiala.beneficiar );
        this.$fond.text( denumireFond );
        
        this.$valoare.text( Number.formatCurrency( parametriCheltuiala.valoare ) + ' lei' );
        
        if( parametriCheltuiala.taxe )
        {
            this.$taxe.show();
            this.$taxe.text( ' (din care ' + Number.formatCurrency( parametriCheltuiala.taxe ) + ' lei reprezintă taxe şi impozite)' );
        }
        else
        {
            this.$taxe.hide();
        }
        
        if( cheltuialaData.contributii )
        {
            var coloana = this.FonduriData.isRepartizareMandatory( fondId ) ?
                    'Salarii' :
                    denumireFond;
                    
            this.$coloanaRow.show();
            this.$coloana.text( coloana );
            
            this.$repartizareRow.show();
            this.$spatii.text( String.pluralize( Object.size( cheltuialaData.contributii ), 'apartament', 'apartamente' ) );
        }
        else
        {
            this.$coloanaRow.hide();
            this.$repartizareRow.hide();
        }
    }
        
});

//==============================================================================

var ReparatiiDetailsClass = __DetailsClass.extend(
{
    _setup_: function()
    {
        this.parametruSpatii = 'suprafata';
        
        this.FonduriData = DataResource.get( 'Fonduri' );
    },
    
    _setupElements_: function()
    {
        this.$fond          = this.$valueElements.filter( '.fond' );
        this.$coloana       = this.$valueElements.filter( '.coloana' );
        this.$spatii        = this.$valueElements.filter( '.spatii' );
        
        this.$repartizareRow    = this.$detailsSection.find( '.repartizare-row' );
        this.$coloanaRow        = this.$detailsSection.find( '.coloana-row' );
    },
    
    _populateContent_: function( cheltuialaData )
    {
        var parametriCheltuiala = cheltuialaData.parametri,
            fondId = parametriCheltuiala.fond,
            denumireFond = this.FonduriData.getDenumireFond( fondId );
        
        this.$fond.text( denumireFond );
        
        if( cheltuialaData.contributii )
        {
            var coloana = denumireFond;
                    
            this.$coloanaRow.show();
            this.$coloana.text( coloana );
            
            this.$repartizareRow.show();
            this.$spatii.text( String.pluralize( Object.size( cheltuialaData.contributii ), 'apartament', 'apartamente' ) );
        }
        else
        {
            this.$coloanaRow.hide();
            this.$repartizareRow.hide();
        }
    }
        
});

//==============================================================================

var EnergieElectricaDetailsClass = __DetailsClass.extend(
{
    _setup_: function()
    {
        this.parametruSpatii = 'persoane';
        
        this.EnergieElectricaData   = DataResource.get( 'Configuration' ).getConfiguration( 'energie_electrica' );
        this.StructuraData          = DataResource.get( 'Structura' );
    },
    
    _setupElements_: function()
    {
        this.$scadenta      = this.$valueElements.filter( '.scadenta' );
        this.$contor        = this.$valueElements.filter( '.contor' );
        this.$repartizare   = this.$valueElements.filter( '.repartizare' );
        
        this.$scari         = this.$repartizare.find( '.scari-container' );
        this.$scutiri       = this.$repartizare.find( '.scutiri-container' );
    },
    
    _populateContent_: function( cheltuialaData )
    {
        var parametriCheltuiala = cheltuialaData.parametri,
            contorData          = this.EnergieElectricaData.getContor( parametriCheltuiala.contor ),
            denumirePunctConsum = contorData.denumire;
        
        this.$scadenta.text( Date.format( Date.DATE_WEEKDAY, parametriCheltuiala.scadenta ) );
        this.$contor.text( denumirePunctConsum );
        
        this.populateScari( cheltuialaData );
        this.populateScutiri( cheltuialaData );
    },
    
    populateScari: function( cheltuialaData )
    {
        var spatiiRepartizare = cheltuialaData.contributii;
        
        this.$scari.text( String.pluralize( Object.size( spatiiRepartizare ), 'apartament', 'apartamente' ) );
    },
    
    populateScutiri: function( cheltuialaData )
    {
        var self = this,
            parametriCheltuiala = cheltuialaData.parametri,
            contorData          = this.EnergieElectricaData.getContor( parametriCheltuiala.contor ),
            scutiriContor       = contorData.scutiri,
            spatiiRepartizare   = Object.keys( cheltuialaData.contributii );
    
        this.$scutiri.empty();
    
        if( scutiriContor )
        {
            var index = 0;
            
            Object.each( scutiriContor, function( i, instalatie )
            {
                var spatiiScutite = instalatie.spatii,
                    spatiiScutiteRepartizare = spatiiRepartizare.intersect( spatiiScutite );
                
                if( spatiiScutiteRepartizare.length )
                {
                    index++;

                    var $instalatieTemplate = self._getTemplate( 'instalatie' );

                    $instalatieTemplate.find( '.index' ).text( index );
                    $instalatieTemplate.find( '.denumire' ).text( instalatie.denumire );

                    $instalatieTemplate.appendTo( self.$scutiri );

                    self.ContributiiSection.appendNote( index, instalatie.spatii );
                }
            });
        }
    }
});

//==============================================================================

var __AscensoareDetailsClass = __DetailsClass.extend(
{
    _setup_: function()
    {
        this.parametruSpatii = 'suprafata';
        
        this.AscensoareData = DataResource.get( 'Configuration' ).getConfiguration( 'ascensoare' );
        this.StructuraData = DataResource.get( 'Structura' );
        this.FonduriData = DataResource.get( 'Fonduri' );
    },
    
    _setupElements_: function()
    {
        this.$tableLayout   = this.$detailsSection.find( '.section-table-layout' );
        this.$scadenta      = this.$valueElements.filter( '.scadenta' );
        this.$fond          = this.$valueElements.filter( '.fond' );
        this.$coloanaRow    = this.find( '.coloana-row' );
        this.$coloana       = this.$valueElements.filter( '.coloana' );
    },
    
    _populateContent_: function( cheltuialaData )
    {
        var parametriCheltuiala = cheltuialaData.parametri,
            fondId = parametriCheltuiala.fond;
        
        this.$scadenta.text( Date.format( Date.DATE_WEEKDAY, parametriCheltuiala.scadenta ) );
        this.$fond.text( this.FonduriData.getDenumireFond( fondId ) );
        
        if( this.FonduriData.isRepartizareMandatory( fondId ) )
        {
            this.$coloanaRow.show();
            this.$coloana.text( 'Ascensor' );
        }
        else
        {
            this.$coloanaRow.hide();
        }
        
        this.populateAscensoareContent( parametriCheltuiala.ascensoare, fondId );
    },
    
    populateAscensoareContent: function( ascensoareValues, fondId )
    {
        var self = this,
            valoare = 0,
            repartizareMandatory = this.FonduriData.isRepartizareMandatory( fondId ),
            repartizareOptional = this.FonduriData.isRepartizareOptional( fondId );
        
        this.getAscensoareElements().remove();
        
        Object.each( ascensoareValues, function( ascensorId, ascensorValues )
        {
            var $item = self._getTemplate( 'ascensoare-scara' ),
                scaraId = self.AscensoareData.getAscensor( ascensorId ).scara_id,
                denumireScara = self.StructuraData.getDenumireScara( scaraId ),
                valoareServiciu = ascensorValues.valoare,
                valoareCurrency = Number.formatCurrency( valoareServiciu ) + ' lei',
                repartizareText,
                repartizareSpatii;
            
            $item.find( '.denumire-scara' ).text( denumireScara );
            $item.find( '.valoare-serviciu' ).text( valoareCurrency );
            
            if( repartizareMandatory ||
                (  repartizareOptional && !Object.isEmpty( ascensorValues.repartizare ) ) )
            {
                repartizareSpatii = _Cheltuieli.RepartizareScara.getSummary({
                    scaraId:        scaraId,
                    repartizare:    ascensorValues.repartizare,
                    shortSummary:   true,
                    scaraSuffix:    false
                });
                
                repartizareText = ', repartizaţi la {repartizare}'.assign({
                        repartizare:    repartizareSpatii
                });
                
                $item.find( '.repartizare' ).text( repartizareText );
            }
            
            valoare += Number.toNumber( valoareServiciu );
            
            $item.appendTo( self.$tableLayout );
        });
        
        this.$valoare.text( Number.formatCurrency( valoare ) + ' lei' );
    },
    
    getAscensoareElements: function()
    {
        return this.find( 'tr.ascensoare-scara' );
    }

});

//------------------------------------------------------------------------------

var IntretinereAscensorDetailsClass = __AscensoareDetailsClass.extend({});

//------------------------------------------------------------------------------

var AutorizatieAscensorDetailsClass = __AscensoareDetailsClass.extend({});

//------------------------------------------------------------------------------

var LucrariAscensorDetailsClass = __AscensoareDetailsClass.extend({});

//==============================================================================

var SalubrizareDetailsClass = __DetailsClass.extend(
{
    _setup_: function()
    {
        this.parametruSpatii = 'persoane';
        
        this.StructuraData = DataResource.get( 'Structura' );
    },
    
    _setupElements_: function()
    {
        this.$scadenta      = this.$valueElements.filter( '.scadenta' );
        var $repartizare    = this.$valueElements.filter( '.repartizare' );
        
        this.$repartizareSpatii     = $repartizare.find( '.spatii' );
        this.$repartizareReducere   = $repartizare.find( '.reducere' );
    },
    
    _populateContent_: function( cheltuialaData )
    {
        var self = this,    
            parametriCheltuiala = cheltuialaData.parametri,
            scadentaText = '',
            repartizareSpatiiText = '',
            persoaneCount = 0,
            reducere,
            reducereText,
            persoaneReducere = 0,
            reducereSpatiiList = [];
        
        scadentaText = Date.format( Date.DATE_WEEKDAY, parametriCheltuiala.scadenta );
        this.$scadenta.text( scadentaText );
        
        Object.each( cheltuialaData.contributii, function( spatiuId, contributie )
        {
            var spatiuData = self.StructuraData.getSpatiuInfo( spatiuId ),
                persoaneSpatiu = spatiuData.nr_pers.toNumber();
                
            persoaneCount += persoaneSpatiu;
        });
        
        repartizareSpatiiText = 
                String.pluralize( Object.size( cheltuialaData.contributii ), 'apartament', 'apartamente' ) +
                ', având un total de ' + String.pluralize( persoaneCount, 'persoană', 'persoane' );
        
        this.$repartizareSpatii.text( repartizareSpatiiText );

        reducere = parametriCheltuiala.reducere;
        
        if( !Object.isEmpty( reducere ) )
        {
            this.$repartizareReducere.show();
            
            Object.each( reducere.spatii, function( spatiuId, p )
            {
                persoaneReducere += p.toNumber();
            });
            
            reducereText = 
                    '(1) dintre care ' + String.pluralize( persoaneReducere, 'persoană', 'persoane' ) + 
                    ' beneficiază de o reducere de ' + reducere.procent + '%';
            
            this.$repartizareReducere.text( reducereText );
            
            reducereSpatiiList = Object.keys( reducere.spatii );
            this.ContributiiSection.setNote( '1', reducereSpatiiList );
        }
        else
        {
            this.$repartizareReducere.hide();
        }
    }
});

//==============================================================================

var GazeNaturaleDetailsClass = __DetailsClass.extend(
{
    _setup_: function()
    {
        this.parametruSpatii = 'persoane';
        this.GazeNaturaleData = DataResource.get( 'Configuration' ).getConfiguration( 'gaze_naturale' );
    },
    
    _setupElements_: function()
    {
        this.$scadenta      = this.$valueElements.filter( '.scadenta' );
        this.$bransament    = this.$valueElements.filter( '.bransament' );
        this.$repartizare   = this.$valueElements.filter( '.repartizare' );
    },
    
    _populateContent_: function( cheltuialaData )
    {
        var parametriCheltuiala = cheltuialaData.parametri,
            denumireBransament = this.GazeNaturaleData.getDenumireBransament( parametriCheltuiala.bransament ),
            repartizareText = String.pluralize( Object.size( cheltuialaData.contributii ), 'apartament', 'apartamente' );
        
        this.$scadenta.text( Date.format( Date.DATE_WEEKDAY, parametriCheltuiala.scadenta ) );
        this.$bransament.text( denumireBransament );
        this.$repartizare.text( repartizareText );
    }
    
});

//==============================================================================

var ContributiiSectionClass = _Components.Container.extend(
{
    __interface: [ 'populate', 'setNote' ],
    
    _setupResources_: function()
    {
        this.SpatiiPanel = new _Spatii.SpatiiPanel( this.find( '.spatii-panel-component' ) );
    },
    
    populate: function( contributii, parametruSpatiu )
    {
        var spatii = Object.keys( contributii );
        
        this.SpatiiPanel.render({
            showSpatii:         spatii,
            viewMode:           'all',
            parametruSpatii:    parametruSpatiu,
            operatingMode:      'list',
            operatingParams:    { headerTitle: 'Contribuţie' },
            valoriSpatii:       contributii
        });
    },
    
    setNote: function( note, spatii )
    {
        this.SpatiiPanel.setNote( note, spatii, 'suma' );
    },
    
    appendNote: function( note, spatii )
    {
        this.SpatiiPanel.appendNote( note, spatii, 'suma' );
    }
    
});

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

_Cheltuieli.CheltuieliGospodarestiDetails = CheltuieliGospodarestiDetailsClass;
_Cheltuieli.SalariiDetails              = SalariiDetailsClass;
_Cheltuieli.EnergieElectricaDetails     = EnergieElectricaDetailsClass;
_Cheltuieli.IntretinereAscensorDetails  = IntretinereAscensorDetailsClass;
_Cheltuieli.AutorizatieAscensorDetails  = AutorizatieAscensorDetailsClass;
_Cheltuieli.LucrariAscensorDetails      = LucrariAscensorDetailsClass;
_Cheltuieli.SalubrizareDetails          = SalubrizareDetailsClass;
_Cheltuieli.GazeNaturaleDetails         = GazeNaturaleDetailsClass;
_Cheltuieli.ReparatiiDetails            = ReparatiiDetailsClass;

})();
