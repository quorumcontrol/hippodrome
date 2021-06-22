type ThenArg<T> = T extends PromiseLike<infer U> ? U : T
export default ThenArg
