const getfileNameAndExt = (str) => {
  var file = str.split('/').pop();
  return [file.substr(0,file.lastIndexOf('.')),file.substr(file.lastIndexOf('.')+1,file.length)]
}

export default getfileNameAndExt
