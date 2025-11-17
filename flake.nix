{
  description = "A devshell for the yugioh banlist project";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";
    devshell.url = "github:numtide/devshell";
  };

  outputs = { self, nixpkgs, flake-parts, devshell, ... }@inputs:
    flake-parts.lib.mkFlake { inherit inputs; } {
      systems = [ "x86_64-linux" ];
      imports = [
        inputs.devshell.flakeModule
      ];
      perSystem = { pkgs, ... }: {
        devshells.default = {
          packages = with pkgs; [
            nodejs_20
            pnpm
            python311
          ];
        };
      };
    };
}
