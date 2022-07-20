console.clear();console.log(":)");

var client = mqtt.connect('ws://static.blitzd.uk:9001/ws');

client.on('connect', function () {
  document.querySelector('#statusConnection').innerText = 'Connected';
  client.subscribe('#');
});

client.on('close', function () {
  document.querySelector('#statusConnection').innerText = 'Disconnected';
  /*
  numMessages = numTopics = 0;
  elStatusMessages.innerText = numMessages;
  elStatusTopics.innerText = numTopics;
  document.querySelector('tbody').innerHTML = '';
  */
});

var elTbody = document.querySelector('tbody');
var elStatusTopics = document.querySelector('#statusTopics');
var elStatusMessages = document.querySelector('#statusMessages');
var topicEls = {};
var numTopics = 0;
var numMessages = 0;
client.on('message', function (topic, payload, packet) {
  console.log(packet);
  if (!topicEls[topic]) {
    let el = {};
    el.row = document.createElement('tr');
    el.topic = document.createElement('td');
    el.topic.appendChild(document.createTextNode(topic));
    el.message = document.createElement('td');
    el.row.appendChild(el.topic);
    el.row.appendChild(el.message);
    elTbody.appendChild(el.row);
    topicEls[topic] = el;
    elStatusTopics.innerText = ++numTopics;
    el.row.addEventListener('webkitAnimationEnd', function () {
      el.row.classList.remove('flash');
    });
    el.row.addEventListener('click', function () {
      document.querySelector('#sendTopic').value = el.topic.innerText;
      document.querySelector('#sendMessage').value = el.message.innerText;
    });
  };
  let el = topicEls[topic];
  el.message.innerText = payload.toString();
  elStatusMessages.innerText = ++numMessages;
  el.row.classList.add('flash');
  el.row.classList[packet.retain ? 'add' : 'remove']('retain');
});

document.querySelector('#btnSend').addEventListener('click', function () {
  client.publish(document.querySelector('#sendTopic').value, document.querySelector('#sendMessage').value);
});