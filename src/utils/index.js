export const asleep = (duration) => {
    return new Promise(resolve => setTimeout(resolve, duration))
}