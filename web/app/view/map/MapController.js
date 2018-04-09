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
                    selectreport: 'selectReport',
                    selectevent: 'selectEvent',
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
        this.setTimes('today');
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

    //HACK
    selectDevice: function (device, center) {
        this.selectedDevice = device;
        if (device && device !== null) {
            var deviceId;
            deviceId = this.selectedDevice.id;
            this.displayDeviceHistory(deviceId);
        }

    },

    selectReport: function (position, center) {
    },

    selectEvent: function (position) {
    },

    deselectFeature: function () {
            this.selectedDevice = null;
    },

    setTimes: function(key) {
        var from, to;
        // code copied from view/dialog/ReportConfigController.js -> onPeriodChange()
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
                default:
                    break;
            }
            from.setHours(0, 0, 0, 0);
            to.setHours(0, 0, 0, 0);

        // end of code copied from view/dialog/ReportConfigController.js -> onPeriodChange()
        this.from = from;
        this.to = to;
    },

    displayDeviceHistory: function(deviceId) {
        // function based on view/ReportController.js -> onReportClick(button)

        // show a spinner over the map
        var el = Ext.get('mainMapView');
        el.mask(Strings.sharedLoading);

        Ext.getStore('ReportRoute').removeAll();
        Ext.getStore('ReportRoute').showMarkers = true;
        Ext.getStore('ReportRoute').load({
            params: {
                deviceId: deviceId,
                from: this.from.toISOString(),
                to: this.to.toISOString()
            },
            scope: this,
            callback: function(records, operation, success) {
                // hide the spinner
                el.unmask();
            }
        });
    },

    onMyReportPeriodChange: function(combobox, newValue, oldValue) {

        /* var devices_grid = Ext.getCmp('devicesView');
        if (devices_grid) {
                window.alert("devicesView found");
        } else {
                window.alert("devicesView not found");
        } */
        this.setTimes(newValue);

        this.myRefresh();

        // EDIT: sob, 7 kwi 2018, 15:13:32 CEST
        // TODO: domyślny wybór pierwszego urządzenia na liście po lewej stronie,
        //
        // EDIT: sob, 7 kwi 2018, 15:19:40 CEST
        // ISTOTNE
        // TODO: nowe opcje: w ostatnim miesiącu, w ostatnim tygodniu
        //      - poza "W tym tygodniu", "W poprzednim tygodniu",
        //
        //EDIT: sob, 7 kwi 2018, 16:56:22 CEST
        //ISTOTNE
        //- pamiętać o używaniu this, np. this.displayDeviceHistory(),
        //
    },

    myRefresh: function() {
        var deviceId = null;

        if (this.selectedDevice && this.selectedDevice !== null) {
                deviceId = this.selectedDevice.id;
        } else {
                window.alert(Strings.mapPleaseChooseDevice);
                return;
        }

        this.displayDeviceHistory(deviceId);
    }
});
