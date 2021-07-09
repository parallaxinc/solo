/*
 *   TERMS OF USE: MIT License
 *
 *   Permission is hereby granted, free of charge, to any person obtaining a
 *   copy of this software and associated documentation files (the "Software"),
 *   to deal in the Software without restriction, including without limitation
 *   the rights to use, copy, modify, merge, publish, distribute, sublicense,
 *   and/or sell copies of the Software, and to permit persons to whom the
 *   Software is furnished to do so, subject to the following conditions:
 *
 *   The above copyright notice and this permission notice shall be included in
 *   all copies or substantial portions of the Software.
 *
 *   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *   FITNESS FOR A PARTICULAR PURPOSE AND NONINFINGEMENT. IN NO EVENT SHALL
 *   THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 *   FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 *   DEALINGS IN THE SOFTWARE.
 */

describe('Page loaded', () => {
  const hostUrl = 'http://localhost:8082'
  const wait = () => {
    setTimeout(() => {
      console.log('waiting for resources...')
    }, 2500)
  }

  it('Looks for branding logo', () => {
    cy.visit(hostUrl)
    cy.get('#nav-logo')
        .should('have.id', 'nav-logo')
        .should('have.css',
            'background-image',
            `url("${hostUrl}/images/logo_small.png")`)
  })

  it('Verifies the compiler buttons', () => {
    cy.visit(hostUrl)
    cy.get('#prop-btn-comp')
        .should('have.class', 'disabled')
    cy.get('#prop-btn-ram')
        .should('have.class', 'disabled')
    cy.get('#prop-btn-eeprom')
        .should('have.class', 'disabled')
    cy.get('#prop-btn-term')
        .should('have.class', 'disabled')
    cy.get('#prop-btn-graph')
        .should('have.class', 'disabled')
  })

  it('Verifies the project file buttons', () => {
    cy.visit(hostUrl)
    cy.get('#btn-view-propc')
        .should('have.css', 'display')
        .and('match', /none/)
    cy.get('#btn-view-blocks')
        .should('have.css', 'display')
        .and('match', /none/)
    cy.get('#btn-view-xml')
        .should('have.css', 'display')
        .and('match', /none/)
  })
})
