import flatten from 'array-flatten'

export default (...middlewareDefs) => flatten(middlewareDefs)
