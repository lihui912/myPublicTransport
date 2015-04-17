var map, load_map = !1,
  route = !1,
  find_route_counter = 0,
  update_stop_location, lookup_stop_id, route_map_idx = 0,
  from_marker, to_marker, stop_locations = {
    from: {
      icon: "http://maps.google.com/mapfiles/dd-start.png"
    },
    to: {
      icon: "http://maps.google.com/mapfiles/dd-end.png"
    }
  },
  route_markers = [],
  update_html = function () {
    var d = $("head > title"),
      n = $("span[jscontent='from.name']"),
      t = $("span[jscontent='to.name']"),
      g = $("input[name=prefer]:checked");
    d.html("Travelling from " + n.html() + " to " + t.html() + " | MYrapid Journey Planner");
    _gaq.push(["_trackEvent", "JP", "Origin", n.html()]);
    _gaq.push(["_trackEvent", "JP", "Destination", t.html()]);
    _gaq.push(["_trackEvent", "JP", "Mode", g.val()]);
    _gaq.push(["_trackPageview", location.pathname + location.search + location.hash]);
    return !0
  };
$(function () {
  var d = function () {
    $("#map").width($("body").width() - 0);
    $("#map").css("left", 0);
    $("#panel").width(0);
    $("#legend").css("left", 10);
    map && google.maps.event.trigger(map, "resize")
  };
  $(window).bind("resize", d);
  d();
  $(".route").live("click", function () {
    var a = $(this).attr("id").split("_")[1];
    v(a)
  });
  d = {
    zoom: 12,
    center: new google.maps.LatLng(3.088, 101.7),
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    streetViewControl: !1
  };
  map = new google.maps.Map(document.getElementById("map"), d);
  var n = new google.maps.DirectionsService,
    t = function () {
      this.leg_markers = [];
      this.polys = [];
      this.ll = [];
      this.fragments = [];
      this.markers = [];
      this.clearMarkers = function () {
        for (var a in this.markers) this.markers[a].setMap(null);
        this.markers = [];
        for (a in this.leg_markers)
          for (var b in this.leg_markers[a]) this.leg_markers[a][b].setMap(null);
        this.leg_markers = [];
        for (a in this.polys) this.polys[a].setMap(null);
        this.polys = []
      }
    },
    g = [],
    u = !1;
  $("#from").focus();
  var l = [],
    w = function (a) {
      this.type = a;
      this.line = []
    },
    y = function (a, b, e, c, r) {
      if (3 == a.routes[b].route[e].route.type) {
        a =
          a.routes[b].route[e].stops;
        b = a[a.length - 1];
        new google.maps.LatLng(1 * b.location[0], 1 * b.location[1]);
        b = new w("");
        g[r].fragments[e] = [];
        for (var j in a)
          if (!(0 > a[j].is_wp && j < a.length - 1))
            if (c = new google.maps.LatLng(1 * a[j].location[0], 1 * a[j].location[1]), a[j].line && $.isArray(a[j].line) && j < a.length - 1) {
              "noroute" != b.type && ("" != b.type && (b.line.push(c), g[r].fragments[e].push(b)), b = new w("noroute"));
              b.line.push(c);
              for (var d in a[j].line) c = new google.maps.LatLng(1 * a[j].line[d][0], 1 * a[j].line[d][1]), b.line.push(c)
            } else {
              if ("route" !=
                b.type || 21 < b.line.length) "" != b.type && (b.line.push(c), g[r].fragments[e].push(b)), b = new w("route");
              b.line.push(c)
            }
        1 < b.line.length && "" != b.type && g[r].fragments[e].push(b);
        var i = [],
          h = function (a, b, c) {
            if (b >= g[c].fragments[a].length) g[c].polys[a].setPath(i);
            else if ("noroute" == g[c].fragments[a][b].type) i.push.apply(i, g[c].fragments[a][b].line), h(a, b + 1, c);
            else {
              var e = g[c].fragments[a][b].line,
                j = e.shift(),
                d = e.pop(),
                r = [],
                l;
              for (l in e) r.push({
                location: e[l],
                stopover: !0
              });
              n.route({
                origin: j,
                destination: d,
                travelMode: google.maps.DirectionsTravelMode.DRIVING,
                optimizeWaypoints: !1,
                waypoints: r
              }, function (e, g) {
                g == google.maps.DirectionsStatus.OK ? (i.push.apply(i, e.routes[0].overview_path), h(a, b + 1, c)) : g == google.maps.DirectionsStatus.OVER_QUERY_LIMIT ? console.log("Google Directions API over query limit.") : g == google.maps.DirectionsStatus.REQUEST_DENIED ? console.log("Google Directions API request denied.") : console.log("Unknown Google Directions API error:" + g)
              })
            }
          };
        h(e, 0, r)
      }
    },
    x = function (a, b) {
      g[a] ? g[a].clearMarkers() : g[a] = new t;
      var e = l.routes[b].stops,
        c = 1 * e[0].stop.location[0],
        d = 1 * e[0].stop.location[1],
        j = new google.maps.LatLng(c, d),
        h;
      h = u ? u : new google.maps.LatLngBounds(j, j);
      for (var i in e) {
        var n = [];
        g[a].leg_markers.push([]);
        c = 1 * e[i].stop.location[0];
        d = 1 * e[i].stop.location[1];
        j = new google.maps.LatLng(c, d);
        g[a].ll.push(j);
        n.push(j);
        h.extend(j);
        var f = "",
          k = new google.maps.Point(0, 0),
          q = new google.maps.Point(-16, 28),
          f = e[i].route.type;
        if ("0" == f) f = "http://chart.googleapis.com/chart?chst=d_trL&chld=l|walk|2", q = new google.maps.Point(31, 28);
        else if ("2" == f) f = -1 !== e[i].stop.name.search("/monorail/i") ?
          "http://chart.googleapis.com/chart?chst=d_tr&chld=r|tram|" + e[i].route.code + "|ffffff|04BA13|04BA13|2" : "http://chart.googleapis.com/chart?chst=d_tr&chld=r|rail|" + e[i].route.code + "|ffffff|ff0000|000066|2", q = new google.maps.Point(0, 28);
        else if ("3" == f) {
          q = e[i].route.code;
          f = "FF3333";
          switch (q.substring(0, 1)) {
          case "T":
            f = "00CC66";
            break;
          case "U":
            f = "00CCCC";
            break;
          case "B":
            f = "FF3333";
            break;
          case "E":
            f = "FF9933"
          }
          "BET" == q.substring(0, 3) && (f = "666699");
          f = "http://chart.googleapis.com/chart?chst=d_tr&chld=r|bus|" + e[i].route.code +
            "|ffffff|" + f + "|" + f + "|2";
          q = new google.maps.Point(0, 28)
        } else f = "http://maps.google.com/mapfiles/kml/paddle/" + p + ".png";
        f = new google.maps.Marker({
          icon: new google.maps.MarkerImage(f, "", k, q)
        });
        f.setPosition(j);
        f.setTitle(e[i].stop.name);
        0 == i && f.setMap(map);
        f.setZIndex(2);
        g[a].markers.push(f);
        if (i < l.routes[b].route.length) {
          var k = l.routes[b].route[i].stops,
            q = l.routes[b].route[i].route.type,
            m;
          for (m in k)
            if (0 < m && m < k.length && (c = 1 * k[m].location[0], d = 1 * k[m].location[1], c = new google.maps.LatLng(c, d), g[a].ll.push(c),
                n.push(c), h.extend(c), f = new google.maps.Marker({
                  icon: "/images/routetype_" + q + ".8x8.png"
                }), f.setPosition(c), f.setTitle(k[m].name), f.setMap(map), g[a].leg_markers[g[a].leg_markers.length - 1].push(f)), m < k.length - 1 && k[m].line && $.isArray(k[m].line)) {
              var f = k[m].line,
                s;
              for (s in f) c = 1 * f[s][0], d = 1 * f[s][1], c = new google.maps.LatLng(c, d), n.push(c), h.extend(c)
            }
          k = {
            strokeColor: "#5050FF",
            strokeOpacity: 0.6,
            strokeWeight: 5
          };
          1 == a && (k.strokeColor = "#ff5050");
          3 == l.routes[b].route[i].route.type ? k.strokeColor = 0 == a ? "#ff5050" :
            "#50ff50" : 0 == l.routes[b].route[i].route.type && (k.strokeColor = "#000");
          k = new google.maps.Polyline(k);
          k.setPath(n);
          k.setMap(map);
          g[a].polys[i] = k;
          y(l, b, i, j, a)
        }
      }
      google.maps.event.trigger(map, "resize");
      u = h;
      map.fitBounds(h)
    },
    v = function (a) {
      $.ajax({
        url: "/query/route?",
        dataType: "json",
        data: {
          route: a
        },
        complete: function () {},
        success: function (a) {
          l = a;
          0 < a.routes.length ? (u = !1, x(0, 0), x(1, 1)) : $("#route").html("No route/bad data")
        }
      })
    };
  update_stop_location = function (a, b) {
    $("#" + b).val(a.name);
    $("#" + b).removeClass("routetype_0");
    $("#" + b).removeClass("routetype_2");
    $("#" + b).removeClass("routetype_3");
    $("#" + b).addClass("routetype_" + a.type);
    $("#" + b + "_id").val(a.id);
    update_location_hash();
    if ("undefined" !== typeof map) {
      var e = new google.maps.LatLng(a.location[0], a.location[1]);
      stop_locations[b].marker || (stop_locations[b].marker = new google.maps.Marker({
        icon: stop_locations[b].icon
      }));
      marker = stop_locations[b].marker;
      marker.setZIndex(50);
      marker.setPosition(e);
      marker.setTitle(b);
      marker.setMap(map);
      var c = new google.maps.LatLngBounds(e,
          e),
        d;
      for (d in stop_locations)
        if ("undefined" !== typeof stop_locations[d].marker) c.extend(stop_locations[d].marker.getPosition());
        else {
          map.panTo(e);
          return
        }
      map.fitBounds(c)
    }
  };
  if (0 < document.location.hash.length) {
    var d = document.location.hash.substring(1).split("&"),
      s;
    for (s in d) {
      var h = d[s].split("=");
      "route" == h[0] ? (route = h[1].toLowerCase(), $("#route_".route).addClass("active"), $(".route").removeClass("active"), v(route)) : ($("#" + h[0] + "_id").val(h[1]), lookup_stop_id(h[1], decodeURIComponent(h[0])))
    }
  } else if (d =
    document.location.href.split("?"), 1 < d.length)
    for (s in d = d[1].split("&"), d) h = d[s].split("="), "route" == h[0] ? (route = h[1].toLowerCase(), $("#route_".route).addClass("active"), $(".route").removeClass("active"), v(route)) : ($("#" + h[0] + "_id").val(h[1]), lookup_stop_id(h[1], decodeURIComponent(h[0])))
});