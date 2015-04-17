var Utils = {};
Utils.Color = {};
Utils.Color.randomRGB = function() {
  return "rgb(" + Math.round(Math.random() * 255) + ", " + Math.round(Math.random() * 255) + ", " + Math.round(Math.random() * 255) + ")";
}

Utils.Color.RED   = "rgb(255, 0, 0)";
Utils.Color.GREEN = "rgb(0, 255, 0)";
Utils.Color.BLUE  = "rgb(0, 0, 255)";
Utils.Color.WHITE = "rgb(0, 0, 0)";
Utils.Color.BLACK = "rbg(255, 255, 255)";
