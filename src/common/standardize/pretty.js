const standardizePretty = (input, slug) => {
  const path = input.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/, '')
  if (input.indexOf("*") === -1) {
    return `/p/${ slug }${ path }*`
  }
  return `/p/${ slug }${ path }`
}
export default standardizePretty
