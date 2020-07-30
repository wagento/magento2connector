/**
 * Copyright Wagento Creative LLC ©, All rights reserved.
 * See COPYING.txt for license details.
 */
$(function () {
    var client = ZAFClient.init();

    showLoadingInformation();
    resizeWidget(client);

    /*
    // OLD Customer data
    client.get('ticket.requester.email').then(
        function (data) {
            var email = data["ticket.requester.email"];
            getCustomerOrderInfo(client, email);
        }
    );*/

    // Get WidgetConfigs
    client.metadata().then(
        function (config) {
            getCustomerOrderList(client, config.settings);
        }
    );
});

function getCustomerOrderList(client, config) {
    var orderField = config.orderfield, 
    emailFldName = "ticket.requester.email",
    orderFldName = "ticket.customField:custom_field_",
    fields = [emailFldName];

    if(!isNaN(orderField)) {
        orderFldName += orderField;
        fields.push(orderFldName);
    }
    client.get(fields).then(
        function (data) {
            var email = data[emailFldName],
            orderIncrementId = data[orderFldName];
            getM2CustomerOrder(client, email, config)
        }
    );
}


// OLD
function getCustomerOrderInfo(client, email) {
    client.metadata().then(
        function (config) {
            console.log("======= getCustomerOrderInfo =======")
            console.log(config)
            getM2CustomerOrder(client, email, config.settings);
        }
    );
}

function getM2CustomerOrder(client, email, config) {
    // var m2domain = config.domain, m2token = config.token;

    var m2domain = 'http://127.0.0.1/zd24o/', 
    m2token = 'fdx0jtouvov4jppiufc4663ifel3pn7l',
    orderfield = '360010492273';

    var settings = {
        url: m2domain + 'rest/V1/customerorder/' + email,
        headers: {"Authorization": "Bearer " + m2token},
        type: 'GET',
        contentType: 'application/json',
        dataType: 'json',
        cors: true
    };

    client.request(settings).then(
        function (data) {
            showCustomerOrderInfo(data, client);
        },
        function (response) {
            showCustomerNotFound(client);
        }
    );
}

function showCustomerOrderInfo(data, client) {
    var source = $("#customer-order-template").html();
    var template = Handlebars.compile(source);
    var html = template(data);
    $("#content").html(html);

    // resize widget after information template is compiled
    resizeWidget(client);

    // prepare onclick events for resize window resize
    var element = $(".accordion-group");
    prepareEventResize(client, element, "shown.bs.collapse");
    prepareEventResize(client, element, "hidden.bs.collapse");
}

function showLoadingInformation() {
    var source = $("#loading-information").html();
    $("#content").html(source);
}

function showCustomerNotFound(client) {
    var source = $("#error-customer-not-found").html();
    $("#content").html(source);
    resizeWidget(client);
}

function prepareEventResize(client, element, event) {
    element.on(event, function () {
        resizeWidget(client);
    });
}

function resizeWidget(client) {
    var h = $("#content").outerHeight() + 40;
    client.invoke('resize', {width: '100%', height: h + 'px'});
    /*
    40 comes from css that add padding to widget on following css rules
    .workspace.apps:not(.ticket_editor_app) .app_view {
        padding: 10px 15px 20px;
        overflow: auto;
    }
    */
}

function formatDate(date) {
    var cdate = new Date(date);
    var options = {
        year: "numeric",
        month: "short",
        day: "numeric"
    };
    date = cdate.toLocaleDateString("en-us", options);
    return date;
}
