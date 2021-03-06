Scalr.regPage('Scalr.ui.tools.openstack.contrail.ipam.view', function (loadParams, moduleParams) {
    var store = Ext.create('store.store', {
        fields: [ 'fq_name', 'uuid', 'network_ipam_mgmt', 'scalr_ntp_server_ip', 'scalr_domain_name' ],
        proxy: {
            type: 'scalr.paging',
            url: '/tools/openstack/contrail/ipam/xList'
        },
        remoteSort: true
    });

    var panel = Ext.create('Ext.grid.Panel', {
        title: Scalr.utils.getPlatformName(loadParams['platform']) + ' &raquo; Networking &raquo; IPAM',

        scalrOptions: {
            //'reload': false,
            'maximize': 'all'
        },

        store: store,

        stateId: 'grid-tools-openstack-contrail-ipam-view',
        stateful: true,

        plugins: {
            ptype: 'gridstore'
        },
        tools: [{
            xtype: 'gridcolumnstool'
        }, {
            xtype: 'favoritetool',
            favorite: {
                text: 'Contrail IPAM',
                href: '#/tools/openstack/contrail/ipam'
            }
        }],

        viewConfig: {
            emptyText: 'No IPAM records found',
            loadingText: 'Loading IPAM records ...'
        },

        columns: [
            { header: "Name", flex: 1, dataIndex: 'fq_name', sortable: false, xtype: 'templatecolumn', tpl: '{[values.fq_name[2]]}' },
            { header: "IP blocks", flex: 1, sortable: false, dataIndex: 'domain_name' },
            { header: "DNS server", flex: 2, sortable: false, xtype: 'templatecolumn', tpl: [
                '<tpl if="network_ipam_mgmt.ipam_dns_method == &quot;virtual-dns-server&quot;">Virtual DNS: {[values.network_ipam_mgmt.ipam_dns_server.virtual_dns_server_name]}',
                '<tpl elseif="network_ipam_mgmt.ipam_dns_method == &quot;tenant-dns-server&quot;">Tenant managed DNS: {[values.network_ipam_mgmt.ipam_dns_server.tenant_dns_server_address.ip_address[0]]}',
                '<tpl elseif="network_ipam_mgmt.ipam_dns_method == &quot;none&quot;">DNS Mode: None',
                '<tpl else><img src="' + Ext.BLANK_IMAGE_URL + '" class="x-icon-minus" /></tpl>'
            ]},
            { header: "NTP server", flex: 1, sortable: false, dataIndex: 'scalr_ntp_server_ip', xtype: 'templatecolumn', tpl: [
                '<tpl if="scalr_ntp_server_ip">{scalr_ntp_server_ip}<tpl else><img src="' + Ext.BLANK_IMAGE_URL + '" class="x-icon-minus" /></tpl>'
            ]},
            { header: "Domain name", flex: 1, sortable: false, dataIndex: 'scalr_domain_name', xtype: 'templatecolumn', tpl: [
                '<tpl if="scalr_domain_name">{scalr_domain_name}<tpl else><img src="' + Ext.BLANK_IMAGE_URL + '" class="x-icon-minus" /></tpl>'
            ]},
            { xtype: 'optionscolumn2',
                menu: [{
                    text: 'Edit',
                    iconCls: 'x-menu-icon-edit',
                    menuHandler: function(data) {
                        var platform = 'platform=' + store.proxy.extraParams.platform,
                            cloudLocation = '&cloudLocation=' + store.proxy.extraParams.cloudLocation,
                            ipamId = '&ipamId=' + data['uuid'],
                            params = platform + cloudLocation + ipamId;

                        Scalr.event.fireEvent('redirect',
                            '#/tools/openstack/contrail/ipam/edit?' + params
                        );
                    }
                }]
            }
        ],

        multiSelect: true,
        selModel: {
            selType: 'selectedmodel'
        },

        listeners: {
            selectionchange: function(selModel, selections) {
                var toolbar = this.down('scalrpagingtoolbar');
                toolbar.down('#delete').setDisabled(!selections.length);
            }
        },

        dockedItems: [{
            xtype: 'scalrpagingtoolbar',
            ignoredLoadParams: ['platform'],
            store: store,
            dock: 'top',
            beforeItems: [{
                text: 'Add IPAM',
                cls: 'x-btn-green-bg',
                handler: function() {
                    var platform = 'platform=' + store.proxy.extraParams.platform,
                        cloudLocation = '&cloudLocation=' + store.proxy.extraParams.cloudLocation,
                        params = platform + cloudLocation;

                    Scalr.event.fireEvent('redirect',
                        '#/tools/openstack/contrail/ipam/create?' + params
                    );
                }
            }],
            afterItems: [{
                ui: 'paging',
                itemId: 'delete',
                disabled: true,
                iconCls: 'x-tbar-delete',
                tooltip: 'Delete',
                handler: function() {
                    var request = {
                        confirmBox: {
                            type: 'delete',
                            msg: 'Delete selected IPAM(s): %s ?'
                        },
                        processBox: {
                            type: 'delete'
                        },
                        params: loadParams,
                        url: '/tools/openstack/contrail/ipam/xRemove/',
                        success: function() {
                            store.load();
                        },
                        failure: function() {
                            store.load();
                        }
                    };

                    var records = panel.getSelectionModel().getSelection(),
                        ipam = [];
                    request.confirmBox.objects = [];

                    for (var i = 0, recordsNumber = records.length; i < recordsNumber; i++) {
                        ipam.push(records[i].get('uuid'));
                        request.confirmBox.objects.push(records[i].get('fq_name')[2])
                    }

                    request.params.ipamId = Ext.encode(ipam);
                    Scalr.Request(request);
                }
            }],

            items: [{
                xtype: 'filterfield',
                store: store
            }, ' ', {
                xtype: 'fieldcloudlocation',
                itemId: 'cloudLocation',
                store: {
                    fields: [ 'id', 'name' ],
                    data: moduleParams.locations,
                    proxy: 'object'
                },
                gridStore: store
            }]
        }]
    });

    return panel;
});
