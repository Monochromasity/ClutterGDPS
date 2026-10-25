// runs when the document's body loads
document.body.onload = () => {
    // Don't run animation if user prefers reduced motion
    if (window.matchMedia("(prefers-reduced-motion: prefers)").matches) return

    const title = document.getElementById("title")

    const fonts = [
        "Arial",
        "Verdana",
        "Tahoma",
        "Trebuchet MS",
        "Times New Roman",
        "Georgia",
        "Garamond",
        "Courier New",
        "Kaushan Script",
       // Brush Script MT is also a default font but it looks like shit so...
    ]
    let timeout = 100,
        timeoutChange = 20

    for (let i = 0; i < 27; i++) {
        const font = fonts[Math.floor(Math.random() * fonts.length)]

        setTimeout(() => title.style.fontFamily = `'${font}', sans-serif`, timeout)

        timeout += timeoutChange
        timeoutChange *= 1.1
    }
    setTimeout(() => title.style.fontFamily = "'Raleway', sans-serif", timeout)
}
