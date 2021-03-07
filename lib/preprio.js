import { createPreprClient } from "@preprio/nodejs-sdk";

const prepr = createPreprClient({
    token: process.env.PREPRIO_PRODUCTION_TOKEN,
    timeout: 4000,
    baseUrl: process.env.PREPRIO_API,
});

export { prepr };

export async function getAllPostsForHome(preview, locale = 'en-GB') {

    // Query publications
    const data = (await prepr
        .graphqlQuery(
            `
      query($locale: String!) {
        Posts( locale : $locale ) {
          items {
            _id,
            _slug,
            date: _publish_on
            title,
            summary,
            author {
                name
                cover {
                    cdn_files {
                        url(width: 100, height:100)
                    }
                }
            }
            cover {
                cdn_files {
                    url(width:2000, height:1000)
                }
            }
          }
        }
      }`
        )
        .graphqlVariables({
            locale: locale
        })
        .token(        preview
            ? process.env.PREPRIO_PREVIEW_TOKEN
            : process.env.PREPRIO_PRODUCTION_TOKEN)
        .fetch() ) || []

    return data.data.Posts.items
}

export async function getAllPostsWithSlug() {

    // Query publications
    const data = (await prepr
        .graphqlQuery(
            `
      query {
        english : Posts(locale : "en-GB") {
          items {
            slug : _slug,
          }
        },
        german : Posts(locale : "de-DE") {
          items {
            slug : _slug,
          }
        }
      }`
        )
        .fetch() ) || []

    var englishPosts = data.data.english.items;
    var germanPosts = data.data.german.items;

    return [...englishPosts, ...germanPosts]
}

export async function getPostAndMorePosts(slug, preview, locale) {

    // Query publications
    const data = (await prepr
        .graphqlQuery(
            `
      query slugPost($slug: String!, $locale: String!) {
        Post ( slug : $slug, locale : $locale) {
            _id,
            _slug,
            date: _publish_on
            title,
            summary,
            content,
            author {
                name
                cover {
                    cdn_files {
                        url(width: 100, height:100)
                    }
                }
            }
            cover {
                cdn_files {
                    url(width:2000, height:1000)
                }
            }
          }
        morePosts : Posts(locale : $locale, where : { _slug_nany : [$slug] }) {
          items {
            _id,
            _slug,
            date: _publish_on
            title,
            summary,
            author {
                name
                cover {
                    cdn_files {
                        url(width: 100, height:100)
                    }
                }
            }
            cover {
                cdn_files {
                    url(width:2000, height:1000)
                }
            }
          }
        }          
      }`
        )
        .graphqlVariables({
                slug: slug,
                locale : locale
            })
        .token(        preview
            ? process.env.PREPRIO_PREVIEW_TOKEN
            : process.env.PREPRIO_PRODUCTION_TOKEN)
        .fetch() ) || []

    return data.data
}

export async function getPreviewPostBySlug(slug) {

    // Query publications
    const data = (await prepr
        .graphqlQuery(
            `
      query preview($slug: String!) {
        Post ( slug : $slug) {
            _id,
            slug : _slug
          }          
      }`
        )
        .token(process.env.PREPRIO_PREVIEW_TOKEN)
        .graphqlVariables({
            slug: slug
        })
        .fetch() ) || []

    return data.data.Post
}