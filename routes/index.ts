export default eventHandler((event) => {
  const address = event.context.params.name
  return { nitro: 'Is Awesome!', address}
})
