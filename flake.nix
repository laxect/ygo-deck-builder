{
  description = "A devshell for the yugioh banlist project";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";
    devshell.url = "github:numtide/devshell";
    treefmt-nix.url = "github:numtide/treefmt-nix";
  };

  outputs = { self, nixpkgs, flake-parts, devshell, treefmt-nix, ... }@inputs:
    flake-parts.lib.mkFlake { inherit inputs; } {
      systems = [ "x86_64-linux" ];
      imports = [
        inputs.devshell.flakeModule
        inputs.treefmt-nix.flakeModule
      ];
      perSystem = { pkgs, ... }: {
        devshells.default = {
          packages = with pkgs; [
            nodejs_20
            pnpm
            python311
          ];
        };

        treefmt = {
          projectRootFile = "flake.nix";

          settings = {
            excludes = [ "*.json" ];
          };

          programs = {
            nixpkgs-fmt.enable = true;
            prettier.enable = true;
          };
        };
      };
    };
}
