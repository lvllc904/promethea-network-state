class Cartographer < Formula
  desc "Sovereign Machine-to-Machine (M2M) synthesis engine for the Shadow Protocol"
  homepage "https://lvhllc.org"
  url "https://storage.googleapis.com/promethea-public/dist/promethea-cartographer-1.0.0.tar.gz"
  sha256 "1104313b6fde63a64b607ecf5c3282aa069899dc74483e7ab7a1f0f153fbe5ab"
  license "MIT"

  depends_on "node"

  def install
    system "npm", "install", *Language::Node.std_npm_install_args(libexec)
    bin.install_symlink Dir["#{libexec}/bin/*"]
  end

  test do
    system "#{bin}/cartographer", "--help"
  end
end
