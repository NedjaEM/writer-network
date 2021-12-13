<template>
  <v-container fluid>
    
    <h1 style="color: #79597b">
      Books written in Arabic by Women and translated to English
    </h1><h3 style="color: #79597b">by Nadia El Mouldi</h3>
    <v-layout>
      <v-col>
        <canvas id="network" width="1200" height="1000"></canvas>
      </v-col>
      <v-col>
        <v-card
          shaped
          color="#e7d3d6"
          class="rounded-card mx-auto mt-5"
          max-width="500"
        >
          <v-card-title>How to read the network?</v-card-title>
          <v-card-text
            >Each node represents an entity: an author, a translator or a
            publisher The links between the nodes represent a book that has been
            translated. You can drag and drop nodes to see clearly.</v-card-text
          >
          <v-timeline align-top dense>
            <v-timeline-item color="#48284a" small>
              <div>
                <div class="font-weight-normal">
                  <strong>Author</strong>
                </div>
              </div>
            </v-timeline-item>
            <v-timeline-item color="#916c80" small>
              <div>
                <div class="font-weight-normal">
                  <strong>Translator</strong>
                </div>
              </div>
            </v-timeline-item>
            <v-timeline-item color="#ffe1c6" small>
              <div>
                <div class="font-weight-normal">
                  <strong>Publisher</strong>
                </div>
              </div>
            </v-timeline-item>
          </v-timeline>
          <v-card-title id="tooltip"></v-card-title>
          <!-- <v-autocomplete :items="this.books"></v-autocomplete> -->
          <v-card-text
            >The data was collected by me over the course of a few months. I
            have consulted multiple sources online and consolidated it into one
            database.</v-card-text
          >
          <v-card-text
            >To be added: a way to hover over a link to see the book
            name</v-card-text
          >
            <v-card-title>Why this network?</v-card-title>
          <v-card-text
            >The goal of this project is to begin to think through the networks of influence involved in the process of translating women authors from Arabic into English, making it possible to think about translation as a pattern as opposed to a case-by-case situation. This visualization
            is a part of a larger project that looks the translations of Arab women writers and explores two main questions: The first is whether the oeuvres written in Arabic by women writers that are chosen for translation are selected based on their propensity to reinforce the stereotypical representation of Arab women in the American social sphere, making such books chosen for translation more palatable for an American audience. 
            The second is whether these books when translated can be perceived as sociological artifacts that reflect the state of Arab countries in a certain time space by the reader, rather than a work of fiction, which they are most of the time.  </v-card-text
          >
          <v-card-text>
            The initial phase of data collection has been completed. That allowed for this network visualization to be the next step of development as it clearly shows the relationship between entities involved in the translation process. It will allow to dig deeper into the relation between each and allowing me to ask more questions about indiviual publishers and translators. By examining the clusters formed in this 
            network, I hope to uncover patterns in the translation of women from Arabic.
          </v-card-text>
           <v-card-text>
            this website is built with Vuejs and the Javascript d3 library, using the d3 force simulation package.
          </v-card-text>
        </v-card>
      </v-col>
    </v-layout>
  </v-container>
</template>

<script>
import books from "../../public/books.csv";
import * as d3 from "d3";
import * as csv from "csv";

export default {
  name: "NetworkGraph",
  props: [],

  data: () => ({
    books,
  }),

  async mounted() {
    this.books = await d3.csv(books);
    console.log(this.books);
    let dim_set = new Set();
    let dim_set_one = new Set();
    let network_data = [];
    this.books.forEach((element) => {
      dim_set_one.add(element.Author);
      dim_set_one.add(element.Translator);
      dim_set_one.add(element["Publishing House"]);
      dim_set.add({ el: element.Author, type: "author" });
      dim_set.add({ el: element.Translator, type: "translator" });
      dim_set.add({ el: element["Publishing House"], type: "publisher" });
      let el = new Object();
      el.source = element.Author;
      el.target = element["Publishing House"];
      el.edge = element["Title in English"];
      network_data.push(el);
      let el1 = new Object();
      el1.source = element.Translator;
      el1.target = element["Publishing House"];
      el1.edge = element["Title in English"];
      network_data.push(el1);
    });

    let data = {
      nodes: [],
      links: [],
    };

    dim_set_one.forEach(function (d, i) {
      for (let el of dim_set) {
        if (d == el.el) {
          data.nodes.push(el);
          break;
        }
      }
    });

    network_data.forEach(function (d, i) {
      data.links.push(d);
    });
    var canvas = d3.select("#network"),
      width = window.innerWidth,
      height = window.innerHeight,
      r = height / 80,
      color = d3.scaleOrdinal().range(["#48284a", "#916c80", "#ffe1c6"]),
      cont = canvas.node().getContext("2d");

    let simulation = d3
      .forceSimulation()
      .force("x", d3.forceX(width / 4))
      .force("y", d3.forceY(height / 2))
      .force("collide", d3.forceCollide(r))
      .force("charge", d3.forceManyBody().strength(-width / 35))
      .force(
        "link",
        d3
          .forceLink()
          .distance(width / 40)
          .id(function (d) {
            return d.el;
          })
      )
      .on("tick", update);

    simulation.nodes(data.nodes);
    simulation.force("link").links(data.links);
    // console.log(canvas.node())

    canvas.call(
      d3
        .drag()
        .container(canvas.node())
        .subject(dragsubject)
        .on("start", function (event) {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          event.subject.fx = event.subject.x;
          event.subject.fy = event.subject.y;
        })
        .on("drag", function (event) {
          event.subject.fx = event.x;
          event.subject.fy = event.y;
        })
        .on("end", function (event) {
          if (!event.active) simulation.alphaTarget(0);
          event.subject.fx = null;
          event.subject.fy = null;
        })
    );

    console.log(window.innerHeight);
    function update() {
      cont.clearRect(0, 0, width, height);

      cont.beginPath();
      cont.strokesStyle = "#aaa";
      data.links.forEach(drawLink);
      cont.stroke();

      cont.beginPath();
      data.nodes.forEach(drawNode);
      cont.fill();

      if (closeNode) {
        cont.beginPath();
        drawNode(closeNode);
        cont.fillStyle = "#FFC6D9";
        cont.fill();
        cont.stroke();
        d3.select("#tooltip")
          .style("opacity", 0.8)
          .style("right", "500px")
          .style("top", "500px")
          .html(
            "You hovered over the&nbsp<u>&nbsp" +
              closeNode.type +
              "</u>&nbsp<b>" +
              closeNode.el +
              "</b>"
          );
      }
    }

    let closeNode;

    canvas.on("mousemove", function (event) {
      var p = d3.pointer(event);
      closeNode = simulation.find(p[0], p[1]);
      update();
    });


    filter("Judgment Day")

    function filter(book_name) {
      console.log(book_name);

      data.links.filter(data.links.edge == book_name);
      // data.nodes.filter(node)

      console.log(data.links);

      //   if (d) {
      //     n.filtered = false;
      //     graph.nodes.push($.extend(true, {}, n));
      //   } else if (typeFilterList.includes(n.group) && !n.filtered) {
      //     n.filtered = true;
      //     graph.nodes.forEach(function (d, i) {
      //       if (n.id === d.id) {
      //         graph.nodes.splice(i, 1);
      //       }
      //     });
      //   }
      // });
    }

    function dragsubject(event) {
      var p = d3.pointer(event);
      console.log(p);
      console.log(simulation.find(p[0], p[1]));
      return simulation.find(p[0], p[1]);
    }

    function drawNode(d) {
      cont.beginPath();
      cont.fillStyle = color(d.type);
      cont.moveTo(d.x, d.y);
      cont.arc(d.x, d.y, r, 0, 2 * Math.PI);
      cont.fill();
    }

    function drawLink(l) {
      cont.moveTo(l.source.x, l.source.y);
      cont.lineTo(l.target.x, l.target.y);
    }
    update();
    console.log("data", data);
  },

  methods: {
    transformData(data) {
      let dim_set = new Set();
      let network_data = [];
      data.forEach((element) => {
        // dim_set.add({"val":element.Author,"type":"author"})
        // dim_set.add({"val":element.Translator,"type":"translator"})
        // dim_set.add({"val":element["Publishing House"],"type":"publisher"})
        dim_set.add(element.Author);
        dim_set.add(element.Translator);
        dim_set.add(element["Publishing House"]);
        let el = new Object();
        el.source = element.Author;
        el.target = element["Publishing House"];
        el.edge = element["Title in English"];
        network_data.push(el);
        let el1 = new Object();
        el1.source = element.Translator;
        el1.target = element["Publishing House"];
        el1.edge = element["Title in English"];
        network_data.push(el1);

        return dim_set;
      });
    },
  },
};
</script>

<style>
canvas {
  position: absolute;
  width: 1200;
  height: 1200;

}

.v-col {
  top: 300;
  height: 100%;
}

.theme--dark {
  background: black !important;
}
</style>
