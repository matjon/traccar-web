/*
 * Copyright 2016 - 2017 Anton Tananaev (anton@traccar.org)
 * Copyright 2016 - 2017 Andrey Kunitsyn (andrey@traccar.org)
 * Copyright 2018 Mateusz Jończyk
 *      Mateusz's work was funded by Partner Security (www.partnersecurity.pl).
 *
 * This file is based on web/app/view/dialog/ReportConfig.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

Ext.define('Traccar.view.dialog.CustomReportPeriod', {
    extend: 'Traccar.view.dialog.Base',

    requires: [
        'Traccar.view.dialog.CustomReportPeriodController',
        'Traccar.view.CustomTimeField'
    ],

    controller: 'customReportPeriod',
    title: Strings.reportCustomTitle,

    items: [{
        xtype: 'fieldcontainer',
        layout: 'vbox',
        reference: 'fromContainer',
        fieldLabel: Strings.reportFrom,
        items: [{
            xtype: 'datefield',
            reference: 'fromDateField',
            startDay: Traccar.Style.weekStartDay,
            format: Traccar.Style.dateFormat,
            value: new Date(new Date().getTime() - 30 * 60 * 1000)
        }, {
            xtype: 'customTimeField',
            reference: 'fromTimeField',
            value: new Date(new Date().getTime() - 30 * 60 * 1000)
        }]
    }, {
        xtype: 'fieldcontainer',
        layout: 'vbox',
        reference: 'toContainer',
        fieldLabel: Strings.reportTo,
        items: [{
            xtype: 'datefield',
            reference: 'toDateField',
            startDay: Traccar.Style.weekStartDay,
            format: Traccar.Style.dateFormat,
            value: new Date()
        }, {
            xtype: 'customTimeField',
            reference: 'toTimeField',
            value: new Date()
        }]
    }],

    buttons: [{
        glyph: 'xf00c@FontAwesome',
        tooltip: Strings.sharedSave,
        tooltipType: 'title',
        minWidth: 0,
        handler: 'onSaveClick'
    }, {
        glyph: 'xf00d@FontAwesome',
        tooltip: Strings.sharedCancel,
        tooltipType: 'title',
        minWidth: 0,
        handler: 'closeView'
    }]
});
