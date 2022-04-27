document.addEventListener('DOMContentLoaded', () => {
  let canvas = document.getElementById('game')
  let ctx = canvas.getContext('2d')

  let up = 0
  let health = 100
  let mood = 100
  let weak = 0
  let last_played_with = 0
  let bored = false

  const alien_is_alive = () => weak < 100 && health > 0

  const alien_still_growing = () => up < 100

  const draw_circle = (x, y, r) => {
    ctx.beginPath()
    ctx.arc(x, y, r, 0.0, 2.0 * Math.PI, false)
    ctx.fill()
  }

  ctx.fillStyle = 'green'
  draw_circle(240, 240, 180)

  const draw_alien = () => {
    ctx.clearRect(0, 0, 480, 480)
    ctx.fillStyle = health >= 50 ? 'blue' : 'rgb(0, 255, 200)'

    draw_circle(240, 110, 80)
    draw_circle(240, 300, 150)

    if (alien_is_alive()) {
      ctx.fillStyle = 'black'
      draw_circle(210, 90, 10)
      draw_circle(270, 90, 10)

      ctx.lineWidth = 5.0
      ctx.beginPath()
      if (bored) {
        ctx.moveTo(200, 140)
        ctx.lineTo(280, 140)
      } else {
        ctx.moveTo(200, 130)
        ctx.lineTo(220, 150)
        ctx.lineTo(260, 150)
        ctx.lineTo(280, 130)
      }
      ctx.stroke()
    } else {
      ctx.lineWidth = 2.0

      ctx.beginPath()
      ctx.moveTo(200, 80)
      ctx.lineTo(220, 100)
      ctx.moveTo(220, 80)
      ctx.lineTo(200, 100)
      ctx.moveTo(260, 80)
      ctx.lineTo(280, 100)
      ctx.moveTo(280, 80)
      ctx.lineTo(260, 100)

      ctx.moveTo(200, 140)
      ctx.lineTo(280, 140)
      ctx.stroke()
    }
  }

  document.querySelector('#wake-up').addEventListener('click', draw_alien_fade_instructions)

  function fade_out_hatch_instructions() {
    $('#boot').fadeOut(400, fade_in_playing_sections)
  }

  function fade_in_playing_sections() {
    $('#levels').fadeIn()
    $('#action-buttons').fadeIn()
  }

  function draw_alien_fade_instructions() {
    draw_alien()
    fade_out_hatch_instructions()
    setTimeout(time_goes_by, 2000)
  }

  function make_alien_hungrier() {
    weak += 5
    document.querySelector('#weak').textContent = 'Weak: ' + weak

    // If it gets too hungry, it starts losing health too.
    if (weak > 50) make_sicker(5)
  }

  function make_unhappier(happiness_lost) {
    mood -= happiness_lost
    if (mood < 0) mood = 0

    document.querySelector('#mood').textContent = 'Mood: ' + mood

    // If it gets a bit unhappy, it starts losing health.
    if (mood < 80) make_sicker(5)
  }

  function make_happier(happiness_gained) {
    mood += happiness_gained
    if (mood > 100) mood = 100

    document.querySelector('#mood').textContent = 'Mood: ' + mood
  }

  function make_sicker(health_lost) {
    health -= health_lost
    if (health < 0) health = 0

    document.querySelector('#health').textContent = 'Health: ' + health

    draw_alien()

    if (!alien_is_alive()) game_over_lost()
  }

  function make_healthier(health_gained) {
    health += health_gained
    if (health > 100) health = 100

    document.querySelector('#health').textContent = 'Health: ' + health

    draw_alien()
  }

  function maybe_make_alien_sicker() {
    if (Math.random() < 0.1) make_sicker(40)
  }

  function make_alien_older() {
    up += 1
    document.querySelector('#up').textContent = 'Up: ' + up + ' hours'
  }

  function maybe_make_alien_bored() {
    var hours_since_last_played_with = up - last_played_with
    if (hours_since_last_played_with > 5) {
      bored = true
      draw_alien()
    }

    if (bored) make_unhappier(5)
    else make_happier(2)
  }

  const feed_alien_some_bread = () => {
    weak -= 20
    if (weak < 0) weak = 0
    document.querySelector('#weak').textContent = 'Weak: ' + weak
    document.querySelector('#vegetables').setAttribute('disabled', true)
    setTimeout(() => document.querySelector('#vegetables').removeAttribute('disabled'), 3000)
  }

  document.querySelector('#vegetables').addEventListener('click', feed_alien_some_bread)

  const feed_alien_sweets = () => {
    weak -= 10
    if (weak < 0) weak = 0
    document.querySelector('#weak').textContent = 'Weak: ' + weak
    make_sicker(5)  // But sweets are not healthy:
    if (alien_is_alive()) {
      document.querySelector('#sweets').setAttribute('disabled', true)
      setTimeout(() => document.querySelector('#sweets').removeAttribute('disabled'), 200)
    }
  }

  document.querySelector('#sweets').addEventListener('click', feed_alien_sweets)

  function give_alien_medicine() {
    make_healthier(40)
    document.querySelector('#medicine').setAttribute('disabled', true)
    setTimeout(() => document.querySelector('#medicine').removeAttribute('disabled'), 5000)
  }

  document.querySelector('#medicine').addEventListener('click', give_alien_medicine)

  function play_game_with_alien() {
    last_played_with = up
    bored = false
    draw_alien()
    document.querySelector('#play').setAttribute('disabled', true)
    setTimeout(() => document.querySelector('#play').removeAttribute('disabled'), 1000)
  }

  document.querySelector('#play').addEventListener('click', play_game_with_alien)

  const game_over_lost = () => {
    document.querySelector('#info').textContent = 'Oh no!  Your Companion died!'
  }

  const game_over_won = () => {
    document.querySelector('#info').textContent = 'Well done!' + '  Your Companion stayed up' + ' 100 hours!'
  }

  function time_goes_by() {
    make_alien_hungrier()
    maybe_make_alien_sicker()
    make_alien_older()
    maybe_make_alien_bored()

    if (alien_is_alive() && alien_still_growing()) setTimeout(time_goes_by, 2000)
    else if (alien_is_alive()) game_over_won()
    else game_over_lost()
  }
})
