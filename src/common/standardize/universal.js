const standardizeUniversal = (input, slug) => {
  if (input.indexOf("*") === -1) {
    return `/u/${ slug }?*url=${ input }`
  }
  return `/u/${ slug }?*url=${ input }*`
}
export default standardizeUniversal
