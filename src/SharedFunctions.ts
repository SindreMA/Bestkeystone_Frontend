import _moment from 'moment'
import momentDurationFormatSetup from "moment-duration-format"
import { mapGetters, mapActions, mapMutations } from 'vuex';
import underscore from 'underscore'

momentDurationFormatSetup(_moment as any);

export const moment = _moment;

export default {
    moment,
    FormatToCloudinary(thisUrl: string, thisQuality?: number | string, thisSize?: string | number, thisFormat?: string ) {
        var url = thisUrl || '';
        if (!url?.toLowerCase()?.startsWith("http")) url = `https://res.cloudinary.com/djpcbbeqx/image/upload/v1664310113/` + url;
        else if (!url?.includes('cloudinary')) return url
        if (!url) return ''
        const p = url?.split('upload')
        const isVideo = (url.endsWith('gif') || url.endsWith('mp4') || url.endsWith('webm'))
        var size = parseInt(`${thisSize}`) ?? (isVideo ? null : 256)
        var quality = parseInt(`${thisQuality}`) ?? (isVideo ? null : 50)
        var format = thisFormat ?? (isVideo ? 'webm' : 'webp')


        let endpart = `upload/${size ? `h_${size},` : ''}${quality ? `q_${quality}` : ''}` + p[1]?.toLowerCase()?.substring(0, p[1].lastIndexOf('.')) + '.' + format;
        endpart = endpart.replaceAll('//', '/')

        return p[0] + endpart

    },

    ...mapGetters(['GetSettings']),
    take(ls,count) {
        return underscore.first(ls,count)
    },
    from(ls, index) {
        return underscore.rest(ls,index)
    },
    //debounce(func, wait, immediate) {
    //    var timeout;
    //    return function() {
    //      var context = this,
    //        args = arguments;
    //      var callNow = immediate && !timeout;
    //      clearTimeout(timeout);
    //      timeout = setTimeout(function() {
    //        timeout = null;
    //        if (!immediate) {
    //          func.apply(context, args);
    //        }
    //      }, wait);
    //      if (callNow) func.apply(context, args);
    //    }
    //  },
    remove(array, element) {
        const index = array.indexOf(element);
        array.splice(index, 1);
      },
    whatChanged(_new, _old) {
        var added = _new.filter(o => !_old.find(o2 => o === o2))
        var removed = _old.filter(o => !_new.find(o2 => o === o2))
        if (added.length != 0) return {type: 'added', value: added[0]}
        else if (removed.length != 0) return {type: 'removed', value: removed[0]}
    },
    groupBy(ls, key) {
        var result = underscore.groupBy(ls,key)
        return result
    },
    AddSpecDetailsToSpec(Specls,specs) {
        for (let i = 0; i < Specls.length; i++) {
            const spec = Specls[i];

            for (let o = 0; o < specs.length; o++) {
                const _spec = specs[o];
                if (_spec.id === spec.spec) {
                    spec.details = _spec
                }
            }
        }
    },
    AddClassToSpecs(Specls,Classls) {
        for (let i = 0; i < Specls.length; i++) {
            const spec = Specls[i];

            for (let o = 0; o < Classls.length; o++) {
                const _class = Classls[o];
                if (_class.id === spec.class_id) {
                    spec.class = _class
                }
            }
        }
    },
    GetRole (ls,role) {
        var _ls = []

        for (let i = 0; i < ls.length; i++) {
            const item = ls[i];

            if (item.role === role) {
                _ls.push(item)
            }
        }
        return _ls;

    },
     TimeToRefresh(time) {
        return {
            date: moment(time).add(4, 'h').toDate(),
            tonow: moment(time).add(4, 'h').toNow(),
        }
    },
    GetUnix(time) {
        return this.GetMoment(time).unix();
    },
    GetMoment(time) {
        return moment(time)
    },
    TimeFromNow(time) {
        return moment(time*1000).fromNow()
    },
    GetTotalScore(items) {
        var total = 0;
        this.getListWithRank(items).forEach(item => {
          total += item.score
        });
        return total
      },
      GetScore(runs) {
        var score: any = 0;
        var zones = underscore.groupBy(runs,x=> x.zone.id);
        for (const zone in zones) {
            if (zones.hasOwnProperty(zone)) {
                const zoneRuns = zones[zone];
                    var bestRun = underscore.sortBy(zoneRuns,'score').reverse()[0];
                    score = score + bestRun.score
            }
        }
        return score
      },
    getListWithRank (_ls) {
        var ls = [..._ls].map(x=> ({...x}))
        for (let i = 0; i < ls.length; i++) {
            const item = ls[i];
            item.raw_display_score = parseFloat(item.display_score)
        }
        var _ls = this._sortBy(ls,"raw_display_score").reverse()
        for (let i = 0; i < _ls.length; i++) {
          const item = _ls[i];
          item.rank = i + 1;
        }
        return _ls
      },
    _sortBy(ls,key){

        var result = underscore.sortBy(ls,key)

        return result
      },
    GetPoints(points, type, procentTotal,runs) {
        var result = "¯\\_(ツ)_/¯"
            if ( type == "total") {
                var score: any = points / 1000
                var split = String(score).split('.')

                if (split[0].length === 1) {
                    score = score.toFixed(3)
                } else if (split[0].length === 2) {
                    score = score.toFixed(2)
                } else if (split[0].length === 3) {
                    score = score.toFixed(1)
                }  else if (split[0].length === 4) {
                    score = score.toFixed(0)
                } else{
                    score = score.toFixed(1)
                }

                if( score != 0 || score){
                    result = score
                }
            }
            else if (type == "percent") {

                var score: any = (points / procentTotal) * 100;
                var split = String(score).split('.')

                if (split[0].length === 1) {
                    score = score.toFixed(2)
                } else if (split[0].length === 2) {
                    score = score.toFixed(1)
                } else if (split[0].length === 4) {
                    score = score.toFixed(0)
                }  else{
                    score = score.toFixed(1)
                }

                if( score != 0 || score){
                    result = score
                }
            }
            else if (type == "mean"){


                var score: any = (points/runs)
                var split = String(score).split('.')


                if (split[0].length === 1) {
                    score = score.toFixed(2)
                } else if (split[0].length === 2) {
                    score = score.toFixed(1)
                } else if (split[0].length === 4) {
                    score = score.toFixed(0)
                }  else{
                    score = score.toFixed(1)
                }

                if( score != 0 || score){
                    result = score
                }
            }

        return result
    },
    clone(obj) {
        if (null == obj || "object" != typeof obj) return obj;
        var copy = obj.constructor();
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
        }
        return copy;
    },
    select(array, field) {
        return underscore.map(array,field)
    },
    log(text,logmode) {
        var mode = 0
        if (!logmode || logmode <= mode) {
            console.log(text);
        }
    },
    GetDefaultView(width,settings){
        if (!settings.forceViewMode) {
            if (width < 780) {
                return 'classic'
            }
        }

        if (settings.viewMode) {
            return settings.viewMode
        }
        return 'table'
    },
    GetSpec(Specs,spec_id) {
        if (!Specs) return null;
        for (let i = 0; i < Specs.length; i++) {
          const spec = Specs[i];
          if (spec_id == spec.id) {
            return spec;
          }
        }
      },
      GetClass(Classes,id) {
        if (Classes) {
            for (let i = 0; i < Classes.length; i++) {
                const _class = Classes[i];
                if (_class.id == id) {
                    return _class
                }
            }
        }
    },
    debounce(func, wait, immediate) {
        var timeout;
        return () => {
            var context = this, args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            }, wait);
            if (immediate && !timeout) func.apply(context, args);
        };
    }


}
