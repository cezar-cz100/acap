(function(){

    var datepicker_ro = {
        closeText: 'Închide',
        prevText: '&laquo; Luna precedentă',
        nextText: 'Luna următoare &raquo;',
        currentText: 'Azi',
        monthNames: ['Ianuarie','Februarie','Martie','Aprilie','Mai','Iunie',
        'Iulie','August','Septembrie','Octombrie','Noiembrie','Decembrie'],
        monthNamesShort: ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun',
        'Iul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        dayNames: ['Duminică', 'Luni', 'Marţi', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă'],
        dayNamesShort: ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm'],
        dayNamesMin: ['Du','Lu','Ma','Mi','Jo','Vi','Sâ'],
        dateFormat: 'dd MM yy', 
        firstDay: 1,
        isRTL: false
    };

    $.datepicker.setDefaults( datepicker_ro );
    
    Date.DATE_WEEKDAY = 'DD, d MM yy';
    Date.DATE_WEEKDAY_SHORT = 'D, d M. yy';
    Date.DATE_WEEKDAY_SHORT_MONTH = 'D, d M.';
    
})();
