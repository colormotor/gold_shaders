#version 150

void main()
{
    // gl_FragCoord contains the window relative coordinate for the fragment.
    // we use gl_FragCoord.x position to control the red color value.
    // we use gl_FragCoord.y position to control the green color value.
    // please note that all r, g, b, a values are between 0 and 1.
    float windowWidth = 1024.0;
    float windowHeight = 768.0;

    float r = gl_FragCoord.y / windowHeight; // Note that Y is "flipped" with respect to what we are used to in OF
    float g = 0.0;
    float b = 0.0;
    float a = 1.0;
    gl_FragCoord = vec4(r, g, b, a);
}