const isArray = Array.isArray || function(value) {
  return {}.toString.call(value) !== "[object Array]"
};

export default {

	applyMovement(p, v, delta) {
		p.add(p.clone().set(delta,delta,delta).multiply(v));
	},

	applyRotation(dp, sphereRadius, sphereObj) {
		sphereObj.rotateOnWorldAxis(dp.clone().set(dp.z/dp.length(), 0.0, -dp.x/dp.length()),dp.length()/sphereRadius);
	},


	checkCollisionCircleCircle(circlePos0, circlePos1, circleRadius) {
		if((circlePos1.x - circlePos0.x)**2.0 + (circlePos0.y - circlePos1.y)**2.0 < circleRadius**2.0+12.0){
			return true;
		}
		else{
			return false;
		}
	},

	checkCollisionCircleSegmentOuter(circlePos, circleRadius, linePos0, linePos1) {
		if((circlePos.x - linePos0.x)**2.0 + (circlePos.y - linePos0.y)**2.0 < circleRadius**2.0 ||
			(circlePos.x - linePos1.x)**2.0 + (circlePos.y - linePos1.y)**2.0 < circleRadius**2.0){
			return true;
		}
		else{
			return false;
		}
	},

	checkCollisionCircleSegmentInner(circlePos, circleRadius, linePos0, linePos1) {
		var l = Math.sqrt( (linePos1.x-linePos0.x)**2+(linePos1.y-linePos0.y)**2);

		var dirX = (linePos1.x-linePos0.x)/l
		var dirY = (linePos1.y-linePos0.y)/l

		var t = dirX*(circlePos.x-linePos0.x) + dirY*(circlePos.y-linePos0.y)

		var x = t*dirX+linePos0.x
		var y = t*dirY+linePos0.y

		var i = (x-circlePos.x)**2+(y-circlePos.y)**2;

		if(i < circleRadius**2 && circlePos.x>linePos0.x && (circlePos.x<linePos1.x || circlePos.y<linePos1.y))
		{
			return true;
		}
		else{
			return false;
		}
	},
	
	//Applies linear and quadratic friction on velocity using time delta
	applyFriction(p, v, delta, qfric, lfric) {
		let speed = v.length();
		let newspeed = speed - (speed * qfric + lfric) * delta;
		if (newspeed < 0) {
			newspeed = 0;
		}
		v.setLength(newspeed);
	},

	checkCircleInHole(circlePos, holePos, holeRadius) {
		//If out of bounds
		if (circlePos.x < -98.5 || circlePos.x > 99.5 || circlePos.y < -53 || circlePos.y > 53) {
			return true;
		}
		
		//If in hole
		let distSq = circlePos.distanceToSquared(holePos);
		return distSq <= (holeRadius * holeRadius);
	},
	
	resolvePositionCollisionCircleCircle(p0, p1, circleRadius) {
		const epsilon = 0.0001;
		
		//Resolve if p0 and p1 are at same position
		if (p0.distanceToSquared(p1) == 0) {
			p0.x += (Math.random() - 0.5) * epsilon;
			p0.y += (Math.random() - 0.5) * epsilon;
		}
		
		//Solve position
		let midpoint = p0.clone().add(p1).divideScalar(2);
		
		let newp0 = p0.clone().sub(midpoint).setLength(circleRadius + epsilon).add(midpoint);
		let newp1 = p1.clone().sub(midpoint).setLength(circleRadius + epsilon).add(midpoint);
		p0.copy(newp0);
		p1.copy(newp1);
	},

	resolveVelocityCollisionCircleCircle(p0, v0, p1, v1, circleRadius, cor) {
		const epsilon = 0.0001;
		
		//Resolve if p0 and p1 are at same position
		if (p0.distanceToSquared(p1) == 0) {
			p0.x += (Math.random() - 0.5) * epsilon;
			p0.y += (Math.random() - 0.5) * epsilon;
		}
		
		//Solve velocity using conservation of momentum
		let diffp01 = p0.clone().sub(p1);
		let diffp10 = p1.clone().sub(p0);
		let diffv01 = v0.clone().sub(v1);
		let diffv10 = v1.clone().sub(v0);
		
		//Perfect elastic collision
		let ev0 = v0.clone().sub(diffp01.clone().multiplyScalar(diffv01.dot(diffp01)/diffp01.lengthSq()));
		let ev1 = v1.clone().sub(diffp10.clone().multiplyScalar(diffv10.dot(diffp10)/diffp10.lengthSq()));
		
		//Inelastic collision
		let avgv = ev0.clone().add(ev1).divideScalar(2);
		
		//Approximate collision with CoR
		let newv0 = ev0.clone().multiplyScalar(cor).add(avgv.clone().multiplyScalar(1 - cor));
		let newv1 = ev1.clone().multiplyScalar(cor).add(avgv.clone().multiplyScalar(1 - cor));
		
		v0.copy(newv0);
		v1.copy(newv1);
	},

	resolveVelocityCollisionCircleSegmentOuter(p, v, ps0, ps1, circleRadius) {
		const epsilon = 0.0001;
		
		//Resolve if two objects are exactly at same position
		if (p.distanceToSquared(ps0) == 0 || p.distanceToSquared(ps1) == 0) {
			p.x += (Math.random() - 0.5) * epsilon;
			p.y += (Math.random() - 0.5) * epsilon;
		}
		
		let d0 = p.clone().sub(ps0);
		let d1 = p.clone().sub(ps1);
		
		let midpoint;
		if (d0.lengthSq() < d1.lengthSq()) {
			midpoint = ps0;
		} else {
			midpoint = ps1;
		}
		
		//Solve velocity using reflection equation
		let normal = p.clone().sub(midpoint).normalize();
		let newv = v.clone().sub(normal.clone().multiplyScalar(2*v.dot(normal)));
		v.copy(newv);
	},

	resolvePositionCollisionCircleSegmentOuter(p, ps0, ps1, circleRadius) {
		const epsilon = 0.0001;
		
		//Resolve if two objects are exactly at same position
		if (p.distanceToSquared(ps0) == 0 || p.distanceToSquared(ps1) == 0) {
			p.x += (Math.random() - 0.5) * epsilon;
			p.y += (Math.random() - 0.5) * epsilon;
		}
		
		//Solve position
		let d0 = p.clone().sub(ps0);
		let d1 = p.clone().sub(ps1);
		
		let midpoint;
		if (d0.lengthSq() < d1.lengthSq()) {
			midpoint = ps0;
		} else {
			midpoint = ps1;
		}
		
		let newp = p.clone().sub(midpoint).setLength(circleRadius + epsilon).add(midpoint);
		p.copy(newp);
	},

	resolveVelocityCollisionCircleSegmentInner(p, v, ps0, ps1, circleRadius) {
		const epsilon = 0.0001;
		
		//Resolve if two objects are exactly at same position
		if (p.distanceToSquared(ps0) == 0 || p.distanceToSquared(ps1) == 0) {
			p.x += (Math.random() - 0.5) * epsilon;
			p.y += (Math.random() - 0.5) * epsilon;
		}
		
		let a = p.clone().sub(ps0);
		let b = ps1.clone().sub(ps0);
		let aprojb = b.clone().multiplyScalar(a.dot(b)/b.dot(b));
		
		//Solve velocity using reflection equation
		let normal = a.clone().sub(aprojb);
		if (normal.lengthSq() == 0) {
			normal.x += (Math.random() - 0.5) * epsilon;
			normal.y += (Math.random() - 0.5) * epsilon;
		}
		normal.normalize();
		
		let newv = v.clone().sub(normal.setLength(2*v.dot(normal)));
		v.copy(newv);
	},

	resolvePositionCollisionCircleSegmentInner(p, ps0, ps1, circleRadius) {
		const epsilon = 0.0001;
		
		//Resolve if two objects are exactly at same position
		if (p.distanceToSquared(ps0) == 0 || p.distanceToSquared(ps1) == 0) {
			p.x += (Math.random() - 0.5) * epsilon;
			p.y += (Math.random() - 0.5) * epsilon;
		}
		
		//Solve position
		let a = p.clone().sub(ps0);
		let b = ps1.clone().sub(ps0);
		let aprojb = b.clone().multiplyScalar(a.dot(b)/b.dot(b));
		
		let normal = a.clone().sub(aprojb);
		if (normal.lengthSq() == 0) {
			normal.x += (Math.random() - 0.5) * epsilon;
			normal.y += (Math.random() - 0.5) * epsilon;
		}
		
		let newp = normal.setLength(circleRadius + epsilon).add(aprojb).add(ps0);
		p.copy(newp);
	},

	//Shuffle from https://stackoverflow.com/questions/18194745/shuffle-multiple-javascript-arrays-in-the-same-way
	shuffle() {
	  var arrLength = 0;
	  var argsLength = arguments.length;
	  var rnd, tmp;

	  for (var index = 0; index < argsLength; index += 1) {
		if (!isArray(arguments[index])) {
		  throw new TypeError("Argument is not an array.");
		}

		if (index === 0) {
		  arrLength = arguments[0].length;
		}

		if (arrLength !== arguments[index].length) {
		  throw new RangeError("Array lengths do not match.");
		}
	  }

	  while (arrLength) {
		rnd = Math.floor(Math.random() * arrLength);
		arrLength -= 1;
		for (let argsIndex = 0; argsIndex < argsLength; argsIndex += 1) {
		  tmp = arguments[argsIndex][arrLength];
		  arguments[argsIndex][arrLength] = arguments[argsIndex][rnd];
		  arguments[argsIndex][rnd] = tmp;
		}
	  }
	}
}