/*
 * Copyright 2015 - 2017 Anton Tananaev (anton@traccar.org)
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

Ext.define('Traccar.view.map.MapController', {
    extend: 'Traccar.view.map.MapMarkerController',
    alias: 'controller.map',

    requires: [
        'Traccar.GeofenceConverter'
    ],

    config: {
        listen: {
            controller: {
                '*': {
                    mapstaterequest: 'getMapState',
                    zoomtoalldevices: 'zoomToAllDevices',
                    selectdevice: 'selectDevice',
                    deselectfeature: 'deselectFeature'
                }
            },
            store: {
                '#Geofences': {
                    load: 'updateGeofences',
                    add: 'updateGeofences',
                    update: 'updateGeofences',
                    remove: 'updateGeofences'
                }
            }
        }
    },

    init: function () {
        this.callParent();
        this.lookupReference('showReportsButton').setVisible(
            Traccar.app.isMobile() && !Traccar.app.getBooleanAttributePreference('ui.disableReport'));
        this.lookupReference('showEventsButton').setVisible(
            Traccar.app.isMobile() && !Traccar.app.getBooleanAttributePreference('ui.disableEvents'));
        this.chosenReportPeriod = 'today';
    },

    showReports: function () {
        Traccar.app.showReports(true);
    },

    showEvents: function () {
        Traccar.app.showEvents(true);
    },

    onFollowClick: function (button, pressed) {
        if (pressed && this.selectedMarker) {
            this.getView().getMapView().setCenter(this.selectedMarker.getGeometry().getCoordinates());
        }
    },

    showLiveRoutes: function (button) {
        this.getView().getLiveRouteLayer().setVisible(button.pressed);
    },

    getMapState: function () {
        var zoom, center, projection;
        projection = this.getView().getMapView().getProjection();
        center = ol.proj.transform(this.getView().getMapView().getCenter(), projection, 'EPSG:4326');
        zoom = this.getView().getMapView().getZoom();
        this.fireEvent('mapstate', center[1], center[0], zoom);
    },

    updateGeofences: function () {
        this.getView().getGeofencesSource().clear();
        if (this.lookupReference('showGeofencesButton').pressed) {
            Ext.getStore('Geofences').each(function (geofence) {
                var feature = new ol.Feature(
                    Traccar.GeofenceConverter.wktToGeometry(this.getView().getMapView(), geofence.get('area')));
                feature.setStyle(this.getAreaStyle(
                    geofence.get('name'), geofence.get('attributes') ? geofence.get('attributes').color : null));
                this.getView().getGeofencesSource().addFeature(feature);
                return true;
            }, this);
        }
    },

    zoomToAllDevices: function () {
        this.zoomToAllPositions(Ext.getStore('LatestPositions').getData().items);
    },

    // HACK
    selectDevice: function (device) {
        var deviceId;

        this.selectedDevice = device;
        if (device && device !== null) {
            deviceId = this.selectedDevice.id;
            this.displayDeviceHistory(deviceId);
        }
    },

    deselectFeature: function () {
        //this.selectedDevice = null;
    },

    setTimes: function (key) {
        var from, to, day, first;

        // Code copied from view/dialog/ReportConfigController.js -> onPeriodChange()
        from = new Date();
        to = new Date();
        switch (key) {
            case 'today':
                to.setDate(to.getDate() + 1);
                break;
            case 'yesterday':
                from.setDate(to.getDate() - 1);
                break;
            case 'thisWeek':
                day = from.getDay();
                first = from.getDate() - day + (day === 0 ? -6 : 1);
                from.setDate(first);
                to.setDate(first + 7);
                break;
            case 'previousWeek':
                day = from.getDay();
                first = from.getDate() - day + (day === 0 ? -6 : 1);
                from.setDate(first - 7);
                to.setDate(first);
                break;
            case 'thisMonth':
                from.setDate(1);
                to.setDate(1);
                to.setMonth(from.getMonth() + 1);
                break;
            case 'previousMonth':
                from.setDate(1);
                from.setMonth(from.getMonth() - 1);
                to.setDate(1);
                break;
            case 'custom':
                return;
            default:
                break;
        }
        from.setHours(0, 0, 0, 0);
        to.setHours(0, 0, 0, 0);

        this.from = from;
        this.to = to;
    },

    displayDeviceHistory: function (deviceId) {
        // Function based on view/ReportController.js -> onReportClick(button)
        var mainMapView;

        /*
         * The meaning of the chosen report period may have changed if the
         * user has the browser window open through 24:00.
         * E.g. 'today' may have shifted from June 25th to June 26th.
         * Therefore, we have to call setTimes() every time we display the
         * device history.
         */
        this.setTimes(this.chosenReportPeriod);

        // Show a spinner over the map
        mainMapView = Ext.get('mainMapView');
        mainMapView.mask(Strings.sharedLoading);

        Ext.getStore('ReportRoute').removeAll();
        Ext.getStore('ReportRoute').showMarkers = true;
        Ext.getStore('ReportRoute').load({
            params: {
                deviceId: deviceId,
                from: this.from.toISOString(),
                to: this.to.toISOString()
            },
            callback: function () {
                // Hide the spinner
                mainMapView.unmask();
            }
        });
    },

    displayCurrentDeviceHistory: function () {
        var deviceId = null;

        if (this.selectedDevice && this.selectedDevice !== null) {
            deviceId = this.selectedDevice.id;
        } else {
            window.alert(Strings.mapPleaseChooseDevice);
            return;
        }

        this.displayDeviceHistory(deviceId);
    },

    onMyReportPeriodChange: function (combobox, newValue) {
        if (newValue == 'custom') {
            // Based on ReportController.js -> onConfigureClick()
            var dialog = Ext.create('Traccar.view.dialog.CustomReportPeriod');
            dialog.callingPanel = this;
            if (this.from !== undefined) {
                dialog.lookupReference('fromDateField').setValue(this.from);
                dialog.lookupReference('fromTimeField').setValue(this.from);
            }
            if (this.to !== undefined) {
                dialog.lookupReference('toDateField').setValue(this.to);
                dialog.lookupReference('toTimeField').setValue(this.to);
            }
            dialog.show();
        } else {
            this.chosenReportPeriod = newValue;

            this.displayCurrentDeviceHistory();
        }
    },

    myRefresh: function () {
        this.displayCurrentDeviceHistory();
    }
});
