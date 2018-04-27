/*
 * Copyright 2016 - 2017 Anton Tananaev (anton@traccar.org)
 * Copyright 2016 - 2017 Andrey Kunitsyn (andrey@traccar.org)
 * Copyright 2018 Mateusz Jończyk
 *      Mateusz's work was funded by Partner Security (www.partnersecurity.pl).
 *
 * This file is based on web/app/view/dialog/ReportConfigController.js
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

Ext.define('Traccar.view.dialog.CustomReportPeriodController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.customReportPeriod',

    onSaveClick: function (button) {
        var callingPanel, from, fromDate, fromTime, to, toDate, toTime;
        callingPanel = this.getView().callingPanel;

        fromDate = this.lookupReference('fromDateField').getValue();
        fromTime = this.lookupReference('fromTimeField').getValue();
        toDate = this.lookupReference('toDateField').getValue();
        toTime = this.lookupReference('toTimeField').getValue();
        // based on code copied from ReportController.js -> onReportClick()
        from = new Date(
                fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate(),
                fromTime.getHours(), fromTime.getMinutes(), fromTime.getSeconds(), 
                fromTime.getMilliseconds());

        to = new Date(
                toDate.getFullYear(), toDate.getMonth(), toDate.getDate(),
                toTime.getHours(), toTime.getMinutes(), toTime.getSeconds(), 
                toTime.getMilliseconds());

        callingPanel.chosenReportPeriod = 'custom';
        callingPanel.from = from;
        callingPanel.to = to;
        callingPanel.displayCurrentDeviceHistory();

        button.up('window').close();
    }
});
