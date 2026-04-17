class Cartographer < Formula
  desc "Sovereign Machine-to-Machine (M2M) synthesis engine for the Shadow Protocol"
  homepage "https://lvhllc.org"
  url "https://storage.googleapis.com/promethea-public/dist/promethea-cartographer-1.0.0.tar.gz"
  sha256 "REPLACE_WITH_SHA256_ONCE_UPLOADED"
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
