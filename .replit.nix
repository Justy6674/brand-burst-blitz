{ pkgs }: {
  deps = [
    pkgs.nodejs-18_x
    pkgs.nodePackages.npm
    pkgs.git
  ];
  env = {
    GIT_AUTHOR_NAME = "Justy6674";
    GIT_AUTHOR_EMAIL = "downscaleweightloss@gmail.com";
    GIT_COMMITTER_NAME = "Justy6674";
    GIT_COMMITTER_EMAIL = "downscaleweightloss@gmail.com";
  };
}