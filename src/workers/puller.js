const SLEEP = 1000;

function pull() {

}

function loop() {
  let job = pull();

  if (job) {
    handle(job, loop);
  } else {
    // console.log(`No job found, sleep for ${SLEEP}ms`);
    setTimeout(loop, SLEEP);
  }
}

function handle(job, done) {

}

function init(done) {
  loop();

  done && done();
}

module.exports = init;
