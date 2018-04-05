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
                    zoomtoalldevices: 'zoomToAllDevices'
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

    onMyReportPeriodChange: function(combobox, newValue, oldValue) {
        var deviceId;
        var from, to;

        window.alert(newValue);
        // TODO: ID urządzenia Sony Xperia Tipo ST21i,
        deviceId = 1;

        // code copied from view/dialog/ReportConfigController.js -> onPeriodChange()
            from = new Date();
            to = new Date();
            switch (newValue) {
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

        Ext.getStore('ReportRoute').removeAll();
        Ext.getStore('ReportRoute').showMarkers = true;
        Ext.getStore('ReportRoute').load({
            params: {
                deviceId: deviceId,
                from: from.toISOString(),
                to: to.toISOString()
            }
        });

	// TODO: trzeba dodać ekran "ładowania", bo dane pojawiają się z pewnym opóźnieniem,
        //
        // EDIT: czw, 5 kwi 2018, 23:23:51 CEST
        // TODO: trzeba aktualizować rysunek po wyborze innego urządzenia,
    }
});
