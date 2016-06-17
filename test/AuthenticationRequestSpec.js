'use strict'

/**
 * Test dependencies
 */
const cwd = process.cwd()
const path = require('path')
const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')

/**
 * Assertions
 */
chai.use(sinonChai)
chai.should()
let expect = chai.expect

/**
 * Code under test
 */
const AuthenticationRequest = require(path.join(cwd, 'src', 'AuthenticationRequest'))

/**
 * Tests
 */


describe('AuthenticationRequest', () => {

  describe('handle', () => {})

  /**
   * Constructor
   */
  describe('constructor', () => {
    let params, req, res, host, provider

    before(() => {
      params = { response_type: 'code' }
      req = { method: 'GET', query: params }
      res = {}
      host = {}
      provider = { host }
    })

    it('should set "req"', () => {
      let request = new AuthenticationRequest(req, res, provider)
      request.req.should.equal(req)
    })

    it('should set "res"', () => {
      let request = new AuthenticationRequest(req, res, provider)
      request.res.should.equal(res)
    })

    it('should set "provider"', () => {
      let request = new AuthenticationRequest(req, res, provider)
      request.provider.should.equal(provider)
    })

    it('should set "host"', () => {
      let request = new AuthenticationRequest(req, res, provider)
      request.host.should.equal(host)
    })

    it('should set "params" from request query', () => {
      let req = { method: 'GET', query: params }
      let request = new AuthenticationRequest(req, res, provider)
      request.params.should.equal(params)
    })

    it('should set "params" from request body', () => {
      let req = { method: 'GET', query: params }
      let request = new AuthenticationRequest(req, res, provider)
      request.params.should.equal(params)
    })

    it('should set "responseTypes"', () => {
      let req = { method: 'GET', query: { response_type: 'code id_token token' } }
      let request = new AuthenticationRequest(req, res, provider)
      request.responseTypes.should.eql([ 'code', 'id_token', 'token' ])
    })

    it('should set "responseMode" default', () => {
      let req = { method: 'GET', query: params }
      let request = new AuthenticationRequest(req, res, provider)
      request.responseMode.should.eql('?')
    })

    it('should set "responseMode" explicitly', () => {
      let req = {
        method: 'GET',
        query: {
          response_type: 'id_token token',
          response_mode: 'query'
        }
      }

      let request = new AuthenticationRequest(req, res, provider)
      request.responseMode.should.eql('?')
    })
  })

  /**
   * Parse Response Types
   */
  describe('parseResponseTypes', () => {
    it('should create an array of response types', () => {
      let params = { response_type: 'code id_token token' }
      AuthenticationRequest.parseResponseTypes(params).should.eql([
        'code',
        'id_token',
        'token'
      ])
    })
  })

  /**
   * Parse Response Mode
   */
  describe('parseResponseMode', () => {
    it('should return "?" for "query" response mode', () => {
      AuthenticationRequest.parseResponseMode({
        response_mode: 'query'
      }).should.equal('?')
    })

    it('should return "#" for "fragment" response mode', () => {
      AuthenticationRequest.parseResponseMode({
        response_mode: 'fragment'
      }).should.equal('#')
    })

    it('should return "?" for "code" response type', () => {
      AuthenticationRequest.parseResponseMode({
        response_type: 'code'
      }).should.equal('?')
    })

    it('should return "?" for "none" response type', () => {
      AuthenticationRequest.parseResponseMode({
        response_type: 'none'
      }).should.equal('?')
    })

    it('should return "#" for other response types', () => {
      AuthenticationRequest.parseResponseMode({
        response_type: 'id_token token'
      }).should.equal('#')
    })
  })

  /**
   * Supported Response Types
   */
  describe('supportedResponseType', () => {})

  /**
   * Supported Response Mode
   */
  describe('supportedResponseMode', () => {})

  /**
   * Required Nonce Provided
   */
  describe('requiredNonceProvided', () => {})

  /**
   * Validate
   */
  describe('validate', () => {

    describe('with missing client_id parameter', () => {
      let params, req, res, host, provider, request

      before(() => {
        sinon.stub(AuthenticationRequest.prototype, 'forbidden')
        params = {}
        req = { method: 'GET', query: params }
        res = {}
        host = {}
        provider = { host }
        request = new AuthenticationRequest(req, res, provider)
        request.validate(request)
      })

      after(() => {
        AuthenticationRequest.prototype.forbidden.restore()
      })

      it('should respond "403 Forbidden"', () => {
        request.forbidden.should.have.been.calledWith({
          error: 'unauthorized_client',
          error_description: 'Missing client id'
        })
      })
    })

    describe('with missing redirect_uri parameter', () => {
      let params, req, res, host, provider, request

      before(() => {
        sinon.stub(AuthenticationRequest.prototype, 'badRequest')
        params = { client_id: 'uuid' }
        req = { method: 'GET', query: params }
        res = {}
        host = {}
        provider = { host }
        request = new AuthenticationRequest(req, res, provider)
        request.validate(request)
      })

      after(() => {
        AuthenticationRequest.prototype.badRequest.restore()
      })

      it('should respond "400 Bad Request"', () => {
        request.badRequest.should.have.been.calledWith({
          error: 'invalid_request',
          error_description: 'Missing redirect uri'
        })
      })
    })

    describe('with unknown client', () => {
      let params, req, res, host, provider, request

      before(() => {
        sinon.stub(AuthenticationRequest.prototype, 'unauthorized')
        params = { client_id: 'uuid', redirect_uri: 'https://example.com/callback' }
        req = { method: 'GET', query: params }
        res = {}
        host = {}
        provider = {
          host,
          getClient: sinon.stub().returns(Promise.resolve(null))
        }
        request = new AuthenticationRequest(req, res, provider)
        request.validate(request)
      })

      after(() => {
        AuthenticationRequest.prototype.unauthorized.restore()
      })

      it('should respond "401 Unauthorized', () => {
        request.unauthorized.should.have.been.calledWith({
          error: 'unauthorized_client',
          error_description: 'Unknown client'
        })
      })
    })

    describe('with mismatching redirect uri', () => {})
    //describe('with mismatching redirect uri', () => {
    //  let params, req, res, host, provider, request

    //  before(() => {
    //    sinon.stub(AuthenticationRequest.prototype, 'redirect')
    //    params = { client_id: 'uuid', redirect_uri: 'https://example.com/callback' }
    //    req = { method: 'GET', query: params }
    //    res = {}
    //    host = {}
    //    provider = {
    //      host,
    //      getClient: sinon.stub().returns(Promise.resolve(null))
    //    }
    //    request = new AuthenticationRequest(req, res, provider)
    //    request.validate(request)
    //  })

    //  after(() => {
    //    AuthenticationRequest.prototype.redirect.restore()
    //  })

    //  it('should respond "302 Redirect"', () => {
    //    request.redirect.should.have.been.calledWith({
    //      error: '...',
    //      error_description: '... mismatching redirect uri'
    //    })
    //  })
    //})

    describe('with missing response_type parameter', () => {
      let params, req, res, host, provider, request

      before(() => {
        sinon.stub(AuthenticationRequest.prototype, 'redirect')
        params = { client_id: 'uuid', redirect_uri: 'https://example.com/callback' }
        req = { method: 'GET', query: params }
        res = {}
        host = {}
        provider = {
          host,
          getClient: sinon.stub().returns(Promise.resolve({
            redirect_uris: [
              'https://example.com/callback'
            ]
          }))
        }
        request = new AuthenticationRequest(req, res, provider)
        request.validate(request)
      })

      after(() => {
        AuthenticationRequest.prototype.redirect.restore()
      })

      it('should respond "302 Redirect"', () => {
        request.redirect.should.have.been.calledWith({
          error: 'invalid_request',
          error_description: 'Missing response type'
        })
      })
    })

    describe('with missing scope parameter', () => {
      let params, req, res, host, provider, request

      before(() => {
        sinon.stub(AuthenticationRequest.prototype, 'redirect')
        params = {
          client_id: 'uuid',
          redirect_uri: 'https://example.com/callback',
          response_type: 'code'
        }
        req = { method: 'GET', query: params }
        res = {}
        host = {}
        provider = {
          host,
          getClient: sinon.stub().returns(Promise.resolve({
            redirect_uris: [
              'https://example.com/callback'
            ]
          }))
        }
        request = new AuthenticationRequest(req, res, provider)
        request.validate(request)
      })

      after(() => {
        AuthenticationRequest.prototype.redirect.restore()
      })

      it('should respond "302 Redirect"', () => {
        request.redirect.should.have.been.calledWith({
          error: 'invalid_scope',
          error_description: 'Missing scope'
        })
      })
    })

    describe('with missing openid scope value', () => {
      let params, req, res, host, provider, request

      before(() => {
        sinon.stub(AuthenticationRequest.prototype, 'redirect')
        params = {
          client_id: 'uuid',
          redirect_uri: 'https://example.com/callback',
          response_type: 'code',
          scope: 'profile'
        }
        req = { method: 'GET', query: params }
        res = {}
        host = {}
        provider = {
          host,
          getClient: sinon.stub().returns(Promise.resolve({
            redirect_uris: [
              'https://example.com/callback'
            ]
          }))
        }
        request = new AuthenticationRequest(req, res, provider)
        request.validate(request)
      })

      after(() => {
        AuthenticationRequest.prototype.redirect.restore()
      })

      it('should respond "302 Redirect"', () => {
        request.redirect.should.have.been.calledWith({
          error: 'invalid_scope',
          error_description: 'Missing openid scope'
        })
      })
    })

    describe('with missing required nonce', () => {})
    describe('with unsupported response type', () => {})
    describe('with unsupported response mode', () => {})
    describe('with valid request', () => {})

  })

  describe('authorize', () => {})
  describe('allow', () => {})
  describe('deny', () => {})
  describe('includeAccessToken', () => {})
  describe('includeAuthorizationCode', () => {})
  describe('includeIDToken', () => {})
  describe('includeSessionState', () => {})
  describe('redirect', () => {})
  describe('unauthorized', () => {})
  describe('forbidden', () => {})
  describe('badRequest', () => {})
  describe('internalServerError', () => {})

})