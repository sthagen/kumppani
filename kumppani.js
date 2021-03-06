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

  const disable = (selector) => { document.querySelector(selector).setAttribute('disabled', true) }
  const enable = (selector) => { document.querySelector(selector).removeAttribute('disabled') }
  const disable_for = (selector, millis) => {
    disable(selector)
    setTimeout(() => enable(selector), millis)
  }

   const fade_out_hatch_instructions = () => {
    const synced_millis = 400
    document.querySelector('#boot').fadeOut(synced_millis)
    setTimeout(() => {
      fade_in_playing_sections()
    }, synced_millis)
  }

  const fade_in_playing_sections = () => {
    document.querySelector('#levels').fadeIn()
    document.querySelector('#action-buttons').fadeIn()
  }

  const draw_alien_fade_instructions = () => {
    draw_alien()
    fade_out_hatch_instructions()
    setTimeout(time_goes_by, 2000)
  }

  document.querySelector('#wake-up').addEventListener('click', draw_alien_fade_instructions)

  const make_alien_hungrier = () => {
    weak += 5
    document.querySelector('#weak').textContent = 'Weak: ' + weak
    if (weak > 50) make_sicker(5)  // If it gets too hungry, it starts losing health too.
  }

  const clamp = (what) => what < 0 ? 0 : ( what > 100 ? 100 : what)

  const update = (what, by) => {
    what += by
    return clamp(what)
  }

  const make_unhappier = (happiness_lost) => {
    mood = update(mood, -happiness_lost)
    document.querySelector('#mood').textContent = 'Mood: ' + mood
    if (mood < 80) make_sicker(5)  // If it gets a bit unhappy, it starts losing health.
  }

  const make_happier = (happiness_gained) => {
    mood = update(mood, happiness_gained)
    document.querySelector('#mood').textContent = 'Mood: ' + mood
  }

  const make_sicker = (health_lost) => {
    health = update(health, -health_lost)
    document.querySelector('#health').textContent = 'Health: ' + health
    draw_alien()
    if (!alien_is_alive()) game_over_lost()
  }

  const make_healthier = (health_gained) => {
    health = update(health, +health_gained)
    document.querySelector('#health').textContent = 'Health: ' + health
    draw_alien()
  }

  const maybe_make_alien_sicker = () => { if (Math.random() < 0.1) make_sicker(40) }

  const make_alien_older = () => {
    up += 1
    document.querySelector('#up').textContent = 'Up: ' + up + ' hours'
  }

  const maybe_make_alien_bored = () => {
    const hours_since_last_played_with = up - last_played_with
    if (hours_since_last_played_with > 5) {
      bored = true
      draw_alien()
    }
    if (bored) make_unhappier(5)
    else make_happier(2)
  }

  const feed_alien_some_vegetables = () => {
    weak = update(weak, -20)
    document.querySelector('#weak').textContent = 'Weak: ' + weak
    disable_for('#vegetables', 3000)
  }

  document.querySelector('#vegetables').addEventListener('click', feed_alien_some_vegetables)

  const feed_alien_sweets = () => {
    weak = update(weak, -10)
    document.querySelector('#weak').textContent = 'Weak: ' + weak
    make_sicker(5)  // Sweets are not healthy.
    if (alien_is_alive()) {
      disable_for('#sweets', 200)
    }
  }

  document.querySelector('#sweets').addEventListener('click', feed_alien_sweets)

  const give_alien_medicine = () => {
    make_healthier(40)
    disable_for('#medicine', 5000)
  }

  document.querySelector('#medicine').addEventListener('click', give_alien_medicine)

  const play_game_with_alien = () => {
    last_played_with = up
    bored = false
    draw_alien()
    disable_for('#play', 1000)
  }

  document.querySelector('#play').addEventListener('click', play_game_with_alien)

  const game_over_lost = () => {
    document.querySelector('#info').textContent = 'Oh no!  Your Companion died!'
  }

  const game_over_won = () => {
    document.querySelector('#info').textContent = 'Well done!' + '  Your Companion stayed up' + ' 100 hours!'
  }

  const time_goes_by = () => {
    make_alien_hungrier()
    maybe_make_alien_sicker()
    make_alien_older()
    maybe_make_alien_bored()
    if (alien_is_alive() && alien_still_growing()) setTimeout(time_goes_by, 2000)
    else if (alien_is_alive()) game_over_won()
    else game_over_lost()
  }
})
