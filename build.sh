
# Githubでホスティングするための静的ファイルを
# docs/distディレクトリに生成する
# 生成物だがGithubでホスティングする目的のために、docs/distディレクトリもコミットしておく

export NUXTJS_ROOT_URL="/slsecrets/dist/"
npm run generate
