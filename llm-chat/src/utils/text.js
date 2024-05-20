export const trimText = (title, target = 50) => {
    if (!title) {
        return ''
    }
    const length = title.length
    if (length < target) {
        return title
    } 
    return `${title.substring(0, target)}...`
}